import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Session {
  id: string
  name: string
  avatar: string
  lastMessage: string
  messages: Message[]
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
  const currentSessionId = ref<string | null>(null)

  const fetchSessions = async () => {
    // TODO: 从后端获取会话列表
    sessions.value = [
      {
        id: '1',
        name: '张三',
        avatar: '',
        lastMessage: '你好！',
        messages: [
          {
            id: '1',
            sender: '张三',
            content: '你好！',
            avatar: '',
            isSelf: false
          }
        ]
      },
      {
        id: '2',
        name: '李四',
        avatar: '',
        lastMessage: '在吗？',
        messages: [
          {
            id: '1',
            sender: '李四',
            content: '在吗？',
            avatar: '',
            isSelf: false
          }
        ]
      }
    ]
  }

  const addMessage = (sessionId: string, message: Message) => {
    const session = sessions.value.find(s => s.id === sessionId)
    if (session) {
      session.messages.push(message)
      session.lastMessage = message.content
    }
  }

  const setCurrentSession = (sessionId: string) => {
    currentSessionId.value = sessionId
  }

  return {
    sessions,
    currentSessionId,
    fetchSessions,
    addMessage,
    setCurrentSession
  }
})
