import { defineStore } from 'pinia'
import { ref } from 'vue'
import { request } from '@/utils/request'

interface Friend {
  userId: string
  username: string
  avatar: string
}

interface ListFriendResponse {
  list: Friend[]
}

export const useFriendStore = defineStore('friend', () => {
  const friends = ref<Friend[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchFriends = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await request.get<ListFriendResponse>('/api/friends')
      friends.value = response.list
    } catch (err) {
      error.value = '获取好友列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    friends,
    loading,
    error,
    fetchFriends
  }
})
