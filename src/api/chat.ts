import { request, wsrequest } from '@/utils/request'

// 获取会话列表
export function getSessions() {
  return request.get<GetSessionsResponse>('/api/message/session')
}

export function listMessage(data: ListMessageParams) {
  return request.get<ListMessageResponse>('/api/message/unread', {params: data})
}

export function ackMessage(data: AckMessageReq) {
  return request.put('/api/message', data)
}

// 发送消息
export async function sendMessage(data: SendMessageParams, data2: GetSeqReq) {
  const seq = await wsrequest.get<number>('/seq', {params: data2})
  data.seq = seq
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
  groupId: number
  seq: number
  kind: string
}

export interface GetSeqReq {
  to_id: number
  kind: string
}

export interface AckMessageReq {
  sessionId: number
  seq: number
}