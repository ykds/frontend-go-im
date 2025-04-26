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
  ownerId: number
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

interface GroupMember {
  id: number
  name: string
  avatar: string
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

export const getGroupMembers = (params: { group_id: number }) => {
  return request.get<{ members: GroupMember[] }>(`/api/group/members`,{params} )
}

export const kickGroupMember = (params: { group_id: number; user_id: number }) => {
  return request.put(`/api/group/member/move-out`, params)
}

export const leaveGroup = (params: { group_id: number }) => {
  return request.post('/api/group/exit', params)
}

export const dismissGroup = (params: { group_id: number }) => {
  return request.post('/api/group/dismiss', params)
}

export const inviteGroupMembers = (params: { group_id: number; member_ids: number[] }) => {
  return request.post('/api/group/invite', params)
}

