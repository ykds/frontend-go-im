import request from '@/utils/request'

interface CreateGroupParams {
  name: string
  avatar: string
}

interface SearchGroupResponse {
  infos: GroupInfo[]
}

interface GroupInfo {
  id: number
  name: string
  avatar: string
  memberCount: number
  groupNo: number
}

export const createGroup = (data: CreateGroupParams) => {
  return request({
    url: '/api/group',
    method: 'post',
    data
  })
}

export const searchGroup = (params: { groupNo: number }) => {
  return request<SearchGroupResponse>({
    url: '/api/group/search',
    method: 'get',
    params
  })
}

export const applyJoinGroup = (groupNo: number) => {
  return request({
    url: '/api/group/apply',
    method: 'post',
    data: { groupNo }
  })
}

