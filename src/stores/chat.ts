import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSessions } from '@/api/chat'

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
  offset: number
}

interface Message {
  id: number
  sender: string
  content: string
  avatar: string
  isSelf: boolean
}

export const useChatStore = defineStore('chat', () => {
  const sessions = ref<Session[]>([])
  const sessionMap = ref<Map<number, Session>>(new Map())
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
        offset: 0,
      }))
      sessionMap.value = new Map(sessions.value.map(session => [session.sessionId, session]))
    } catch (err) {
      error.value = '获取会话列表失败'
      console.error('获取会话列表失败:', err)
      throw err
    }
  }

  const setCurrentSession = async (sessionId: number) => {
    currentSessionId.value = sessionId
  }


  return {
    sessions,
    sessionMap,
    currentSessionId,
    loading,
    error,
    fetchSessions,
    setCurrentSession
  }
})
