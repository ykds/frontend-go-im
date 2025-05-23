import { ref } from 'vue'
import { WS_URL } from '@/config'


interface Message {
  type: number
  data: string
  ack_id?: number
}

interface WebSocketOptions {
  url: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
}

interface AckMessage {
	type: number
  ack_id: number
}

// 定义回调函数类型
type Callback = (data: any) => void

class WebSocketClient {
  private ws: WebSocket | null = null
  private options = {
    url: WS_URL + '/ws',
    reconnectInterval: 1000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 50000
  }
  private reconnectAttempts = 0
  private heartbeatInterval: number | null = null
  private messageCallbacks: Map<number, (content: string, ackId: number|undefined) => void> = new Map()
  private isConnected = ref(false)

  connect() {
    if (this.isConnected.value) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('No token found, not connecting WebSocket')
        return
      }

      this.ws = new WebSocket(this.options.url + "?token=" + token)

      this.isConnected.value = true
      this.reconnectAttempts = 0
      this.startHeartbeat()

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.isConnected.value = true
        this.reconnectAttempts = 0
        this.startHeartbeat()
      }

      this.ws.onmessage = (event) => {
        try {
          const message: Message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket closed')
        this.isConnected.value = false
        this.stopHeartbeat()
        // this.reconnect()
      }

      this.ws.onerror = (error) => {
        this.stopHeartbeat()
        console.error('WebSocket error details:', {
          readyState: this.ws?.readyState,
          url: this.ws?.url,
          error
        })
        // this.reconnect()
      }

    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      // this.reconnect()
    }
  }

  private startHeartbeat() {
    // 先清除可能存在的旧定时器
    this.stopHeartbeat()

    // 创建新的心跳定时器
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // 这里发送心跳消息，具体内容由用户填充
        this.send({
          type: 2, // 心跳消息类型
          data: '' // 心跳消息内容
        })
      }
    }, this.options.heartbeatInterval || 50000)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`)

    setTimeout(() => {
      this.connect()
    }, this.options.reconnectInterval)
  }

  private handleMessage(message: Message) {
    // 调用特定类型的处理函数
    const handler = this.messageCallbacks.get(message.type)
    if (handler) {
      handler(message.data, message.ack_id)
    }
  }

  send(message: Message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected')
      return
    }
    this.ws.send(JSON.stringify(message))
  }

  // 注册全局回调函数
  addGlobalCallback(key: number, callback: (content: string, ackId: number|undefined) => void) {
    this.messageCallbacks.set(key, callback)
  }

  // 移除全局回调函数
  removeGlobalCallback(key: number) {
    this.messageCallbacks.delete(key)
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.isConnected.value = false
      this.stopHeartbeat()
    }
  }
}

// 创建全局WebSocket实例
const wsClient = new WebSocketClient()

export default wsClient
