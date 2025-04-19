import { defineStore } from 'pinia'
import { ref } from 'vue'
import { request } from '@/utils/request'

interface Group {
  id: number
  groupNo: number
  name: string
  avatar: string
  members: MemberInfo[]
}

interface MemberInfo {
  id: number
  name: string
  avatar: string
}

interface ListGroupResponse {
  groups: Group[]
}

export const useGroupStore = defineStore('group', () => {
  const groups = ref<Group[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const groupMap = ref<Record<string, Group>>({})
  const memberMap = ref<Record<string, Record<string, MemberInfo>>>({})

  const fetchGroups = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await request.get<ListGroupResponse>('/api/group')
      groups.value = response.groups
      response.groups.forEach(group => {
        groupMap.value[group.id] = group
      })
      groups.value.forEach(group => {
        memberMap.value[group.id] = {}
        group.members.forEach(member => {
          memberMap.value[group.id][member.id] = member
        })
      })
    } catch (err) {
      error.value = '获取群组列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    groups,
    loading,
    error,
    fetchGroups,
    groupMap,
    memberMap,
  }
}, {
  persist: true
})
