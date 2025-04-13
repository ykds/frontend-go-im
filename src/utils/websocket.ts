import { ref } from 'vue'

interface Message {
  type: number
  content: string
}

interface WebSocketOptions {
  url: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
}

// 定义回调函数类型
type Callback = (data: any) => void

class WebSocketClient {
  private ws: WebSocket | null = null
  private options: WebSocketOptions
  private reconnectAttempts = 0
  private reconnectTimer: number | null = null
  private messageHandlers: Map<number, Callback> = new Map()
  private heartbeatTimer: number | null = null

  public isConnected = ref(false)

  constructor(options: WebSocketOptions) {
    this.options = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 50000,
      ...options
    }
  }

  connect() {
    if (this.ws) {
      this.ws.close()
    }

    try {
      this.ws = new WebSocket(this.options.url + "?token=" + localStorage.getItem('token'))

      this.isConnected.value = true
      this.reconnectAttempts = 0
      this.startHeartbeat()

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.isConnected.value = true
        this.reconnectAttempts = 0
        // 连接成功后启动心跳
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
        // 连接关闭时停止心跳
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
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // 这里发送心跳消息，具体内容由用户填充
        this.send({
          type: 2, // 心跳消息类型
          content: '' // 心跳消息内容
        })
      }
    }, this.options.heartbeatInterval)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= (this.options.maxReconnectAttempts || 5)) {
      console.error('Max reconnection attempts reached')
      return
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectAttempts++
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
      this.connect()
    }, this.options.reconnectInterval)
  }

  private handleMessage(message: Message) {
    // 调用特定类型的处理函数
    const handler = this.messageHandlers.get(message.type)
    if (handler) {
      handler(message.content)
    }
  }

  send(message: Message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected')
      return
    }

    try {
      this.ws.send(JSON.stringify(message))
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  // 注册全局回调函数
  addGlobalCallback(key: number, callback: Callback) {
    this.messageHandlers.set(key, callback)
  }

  // 移除全局回调函数
  removeGlobalCallback(key: number) {
    this.messageHandlers.delete(key)
  }

  close() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    // 关闭时停止心跳
    this.stopHeartbeat()
  }
}

// 创建全局WebSocket实例
const wsClient = new WebSocketClient({
  url: 'ws://localhost:8081/ws'
})

export default wsClient
