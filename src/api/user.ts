import { request } from '@/utils/request'

export const searchUser = (data: SearchUserParams) => {
  return request.get<SearchUserResponse>('/api/user/search', {
    params: data
  })
}

export interface UserInfo {
  id: number
  username: string
  phone: string
  gender: string
  avatar: string
}

export interface SearchUserResponse {
  list: UserInfo[]
}

export interface SearchUserParams {
  phone: string
}


export const applyFriend = (data: ApplyFriendParams) => {
  return request.post('/api/friends/apply', data)
}

export interface ApplyFriendParams {
  friendId: number
}

export const listFriendApply = () => {
  return request.get<ListFriendApplyResponse>('/api/friends/apply')
}

export interface ListFriendApplyResponse {
  list: FriendApplyInfo[]
}

export interface FriendApplyInfo {
  applyId: number
  userId: number
  username: string
  avatar: string
}

export const approveFriendApply = (data: ApproveFriendApplyParams) => {
  return request.put('/api/friends/apply', data)
}

export interface ApproveFriendApplyParams {
  applyId: number
  status: number
}

export const rejectFriendApply = (data: RejectFriendApplyParams) => {
  return request.put('/api/friends/apply', data)
}

export interface RejectFriendApplyParams {
  applyId: number
  status: number
}


