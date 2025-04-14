import { defineStore } from 'pinia'
import { ref } from 'vue'
import { request } from '@/utils/request'

interface Group {
  id: number
  groupNo: number
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

  const fetchGroups = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await request.get<ListGroupResponse>('/api/group')
      groups.value = response.groups
      response.groups.forEach(group => {
        groupMap.value[group.id] = group
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
  }
})
