import { request } from '@/utils/request'
import { defineStore } from 'pinia'
import { ref } from 'vue'


interface UserInfo {
  username: string
  phone: string
  gender: string
  avatar: string
}


export const useUserStore = defineStore('user', ()=>{
  const info = ref<UserInfo>()

  const fetchUserInfo = async ()=> {
    try {
      const response = await request.get<UserInfo>('/api/user/info')
      info.value = response
    } catch(error: any) {
      throw error
    }
  }

  return {
    info,
    fetchUserInfo,
  }
}, {
  persist: true
})