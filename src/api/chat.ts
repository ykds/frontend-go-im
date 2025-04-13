import { request } from '@/utils/request'

// 获取会话列表
export function getSessions() {
  return request.get<GetSessionsResponse>('/api/message/session')
}

export function listMessage(data: ListMessageParams) {
  return request.get<ListMessageResponse>('/api/message/unread', {params: data})
}

// 发送消息
export function sendMessage(data: SendMessageParams) {
  return request.post<string>('/api/message', data)
}

interface SessionInfo {
  sessionId: number
	kind:         string
	groupId:      string
	groupName:    string
	groupAvatar:    string
	friendId:    number
	frienName:    string
	friendAvatar: string
	seq:          number
}


export interface SendMessageParams {
  kind: string
	toId: number
	message: string
	seq: number
}

// 接口响应类型定义
export interface GetSessionsResponse {
  list: SessionInfo[]
}

export interface ListMessageResponse {
  list: MessageInfo[]
}

export interface MessageInfo {
  id:      number
	kind:    string
	content: string
	seq:     number
	fromId:  number
}

export interface ListMessageParams {
  fromId: number
  seq: number
  kind: string
}
