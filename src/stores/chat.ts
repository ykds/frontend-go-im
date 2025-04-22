import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSessions } from '@/api/chat'
import { persistConfig } from './persist'

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
  const userSessionMap = ref<Map<number, number>>(new Map())
  const gsMap = ref<Map<number, number>>(new Map())
  const currentSessionId = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Initialize maps
  const initializeMaps = () => {
    if (!(gsMap.value instanceof Map)) {
      gsMap.value = new Map()
    }
    if (!(sessionMap.value instanceof Map)) {
      sessionMap.value = new Map()
    }
    if (!(userSessionMap.value instanceof Map)) {
      userSessionMap.value = new Map()
    }
  }

  // Call initialization
  initializeMaps()

  const fetchSessions = async () => {
    error.value = null
    try {
      const response = await getSessions()
      const newSessions = response.list.filter(item => !sessions.value.some(session => session.sessionId === item.sessionId))

      // Reinitialize maps before processing new sessions
      initializeMaps()

      if(sessions.value.length > 0) {
        newSessions.forEach(item => {
          sessions.value.push({
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
            offset: item.seq+1,
          })
          sessionMap.value.set(item.sessionId, sessions.value[sessions.value.length - 1])
          if (item.kind === 'single') {
            userSessionMap.value.set(item.friendId, item.sessionId)
          } else if (item.kind === 'group') {
            gsMap.value.set(item.groupId, item.sessionId)
          }
        })
      } else {
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
          offset: item.seq+1,
        }))
        sessionMap.value = new Map(sessions.value.map(session => [session.sessionId, session]))
        sessions.value.forEach(session => {
          if (session.kind === 'single') {
            userSessionMap.value.set(session.friendId, session.sessionId)
          } else if (session.kind === 'group') {
            gsMap.value.set(session.groupId, session.sessionId)
          }
        })
      }
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
    setCurrentSession,
    gsMap,
    userSessionMap,
  }
}, {
  persist: true
})

