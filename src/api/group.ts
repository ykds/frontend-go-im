import { request } from '@/utils/request'

export function searchGroup(data: SearchGroupParams) {
  return request.get<SearchGroupResponse>('/api/group/search', {params: data})
}

interface SearchGroupParams {
  groupNo: number
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


export function applyJoinGroup(data: ApplyJoinGroupParams) {
  return request.post('/api/group/apply', data)
}

interface ApplyJoinGroupParams {
  group_no: number
}

