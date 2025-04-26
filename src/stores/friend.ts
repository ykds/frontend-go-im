import { defineStore } from 'pinia'
import { ref } from 'vue'
import { request } from '@/utils/request'

interface Friend {
  userId: number
  username: string
  avatar: string
  gender: string
}

interface ListFriendResponse {
  list: Friend[]
}

export interface ListFriendApplyResponse {
  list: FriendApplyInfo[]
}

export interface FriendApplyInfo {
  applyId: number
  userId: number
  username: string
  avatar: string
  gender: string
}

export const useFriendStore = defineStore('friend', () => {
  const friends = ref<Friend[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const friendMap = ref<Record<string, Friend>>({})
  const hasUnreadFriendApply = ref(false)
  const applyList = ref<FriendApplyInfo[]>([])

  const fetchFriends = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await request.get<ListFriendResponse>('/api/friends')
      friends.value = response.list
      friendMap.value = {}
      response.list.forEach(friend => {
        friendMap.value[friend.userId] = friend
      })
    } catch (err) {
      error.value = '获取好友列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchApply = async () => {
    try {
      const response = await request.get<ListFriendApplyResponse>('/api/friends/apply')
      applyList.value = response.list
    } catch (error: any) {
      error.value = '获取好友申请列表失败'
      throw error
    }
  }

  return {
    friends,
    applyList,
    loading,
    error,
    fetchFriends,
    fetchApply,
    friendMap,
    hasUnreadFriendApply,
  }
}, {
  persist: true
})
