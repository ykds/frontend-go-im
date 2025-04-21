import { request } from '@/utils/request'

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
  owner_id: number
}

export interface ApplyUserInfo {
  apply_id: number
  name: string
  avatar: string
}

export interface GroupApplyInfo {
  name: string
  avatar: string
  apply: ApplyUserInfo[]
}

interface GetAppliesResponse {
  list: GroupApplyInfo[]
}

export const createGroup = (data: CreateGroupParams) => {
  return request.post('/api/group', data)
}

export const searchGroup = (params: { groupNo: number }) => {
  return request.get<SearchGroupResponse>('/api/group/search', { params })
}

export const applyJoinGroup = (groupNo: number) => {
  return request.post('/api/group/apply', { group_no: groupNo })
}

export const getGroupApplies = () => {
  return request.get<GetAppliesResponse>('/api/group/apply')
}

export const approveGroupApply = (applyId: number) => {
  return request.put(`/api/group/handle/apply`, {apply_id: applyId, status: "accpeted" })
}

export const rejectGroupApply = (applyId: number) => {
  return request.put(`/api/group/handle/apply`, {apply_id: applyId, status: "rejected" })
}

