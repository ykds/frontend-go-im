import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSessions, sendMessage, listMessage } from '@/api/chat'
import wsClient from '@/utils/websocket'

interface Session {
  sessionId: number
	kind:         string
	groupId:      number
	groupName:    string
	groupAvatar:    string
	friendId:    number
	friendName:    string
	friendAvatar: string
	seq:          number

  messages: Message[]
  lastMessage: string
}

interface Message {
  id: string
  sender: string
  content: string
  avatar: string
  isSelf: boolean
}

export const useChatStore = defineStore('chat', () => {
  const sessions = ref<Session[]>([])
  const currentSessionId = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSessions = async () => {
    error.value = null
    try {
      const response = await getSessions()
      sessions.value = response.list.map((item: any) => ({
        sessionId: item.sessionId,
        kind: item.kind,
        groupId: item.groupId,
        groupName: item.groupName,
        groupAvatar: item.groupAvatar,
        friendId: item.friendId,
        friendName: item.friendName,
        friendAvatar: item.friendAvatar,
        seq: item.seq,
        messages: [],
        lastMessage: '',
      }))
    } catch (err) {
      error.value = '获取会话列表失败'
      console.error('获取会话列表失败:', err)
      throw err
    }
  }

  const addMessage = async (sessionId: number, message: Message) => {
    try {
      // 通过WebSocket发送消息
      wsClient.send({
        type: 'message',
        data: {
          kind: 'single',
          toId: sessionId,
          message: message.content,
          seq: 0
        }
      })

      const session = sessions.value.find(s => s.sessionId === sessionId)
      if (session) {
        // session.messages.push(message)
        // session.lastMessage = message.content
      }
    } catch (err) {
      error.value = '发送消息失败'
      console.error('发送消息失败:', err)
      throw err
    }
  }

  const setCurrentSession = async (sessionId: number) => {
    currentSessionId.value = sessionId
  }


  return {
    sessions,
    currentSessionId,
    loading,
    error,
    fetchSessions,
    addMessage,
    setCurrentSession
  }
})
