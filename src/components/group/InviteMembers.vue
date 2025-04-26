<template>
  <div class="invite-members">
    <div class="search-box">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="搜索好友..."
      />
    </div>
    <div class="friends-container">
      <div v-if="filteredFriends.length === 0" class="empty-state">
        <span>没有找到匹配的好友</span>
      </div>
      <div v-else v-for="friend in filteredFriends" :key="friend.userId" class="friend-item">
        <img
          :src="friend.avatar ? API_BASE_URL + friend.avatar : defaultAvatar"
          :alt="friend.username"
          class="friend-avatar"
        />
        <div class="friend-info">
          <span class="friend-name">{{ friend.username }}</span>
          <span v-if="isGroupMember(friend.userId)" class="member-tag">已在群组</span>
        </div>
        <input
          type="checkbox"
          :checked="isGroupMember(friend.userId)"
          :disabled="isGroupMember(friend.userId)"
          @change="handleCheckboxChange(friend)"
          class="checkbox"
        />
      </div>
    </div>
    <div class="action-buttons">
      <button class="cancel-btn" @click="$emit('close')">取消</button>
      <button class="confirm-btn" @click="handleInvite" :disabled="selectedFriends.length === 0">确认邀请</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import defaultAvatar from '@/assets/default-avatar.svg'
import { API_BASE_URL } from '@/config'
import { inviteGroupMembers } from '@/api/group'
import { useFriendStore } from '@/stores/friend'
import { ElMessage } from 'element-plus'

interface Friend {
  userId: number
  username: string
  avatar: string
}

interface GroupMember {
  id: number
  name: string
  avatar: string
}

const props = defineProps<{
  groupId: number
  members: GroupMember[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'refresh'): void
}>()

const friendStore = useFriendStore()
const searchQuery = ref('')
const selectedFriends = ref<Friend[]>([])

const filteredFriends = computed(() => {
  if (!searchQuery.value) {
    return friendStore.friends
  }
  const query = searchQuery.value.toLowerCase()
  return friendStore.friends.filter(friend =>
    friend.username.toLowerCase().includes(query)
  )
})

const isGroupMember = (friendId: number) => {
  return props.members.some(member => member.id === friendId)
}

const handleCheckboxChange = (friend: Friend) => {
  if (isGroupMember(friend.userId)) return

  const index = selectedFriends.value.findIndex(f => f.userId === friend.userId)
  if (index === -1) {
    selectedFriends.value.push(friend)
  } else {
    selectedFriends.value.splice(index, 1)
  }
}

const handleInvite = async () => {
  if (selectedFriends.value.length === 0) return

  try {
    await inviteGroupMembers({
      group_id: props.groupId,
      member_ids: selectedFriends.value.map(friend => friend.userId)
    })
    ElMessage.success('邀请成功')
    emit('refresh')
    emit('close')
  } catch (err: any) {
    ElMessage.error(err.message)
  }
}
</script>

<style scoped>
.invite-members {
  width: 100%;
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.search-box {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.search-box input {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 14px;
}

.friends-container {
  overflow-y: auto;
  padding: 0.5rem;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  gap: 1rem;
}

.friend-item:hover {
  background-color: var(--color-background-soft);
}

.friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.friend-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.friend-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-tag {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid var(--color-border);
  margin-top: auto;
}

.cancel-btn,
.confirm-btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  min-width: 100px;
}

.cancel-btn {
  background: #1890ff;
  color: white;
}

.confirm-btn {
  background: #52c41a;
  color: white;
}

.cancel-btn:hover {
  background: #40a9ff;
}

.confirm-btn:hover {
  background: #73d13d;
}

.cancel-btn:active,
.confirm-btn:active {
  transform: translateY(1px);
}

.confirm-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--color-text-secondary);
  gap: 1rem;
}

.error-state button {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
