<template>
  <div class="member-list">
    <div class="search-box">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="搜索群成员..."
      />
    </div>
    <div class="members-container">

      <div v-if="error" class="error-state">
        <span>{{ error }}</span>
        <button @click="$emit('retry')">重试</button>
      </div>
      <template v-else>
        <div v-if="filteredMembers.length === 0" class="empty-state">
          <span>没有找到匹配的成员</span>
        </div>
        <div v-else v-for="member in filteredMembers" :key="member.id" class="member-item">
          <img
            :src="member.avatar ? API_BASE_URL + member.avatar : defaultAvatar"
            :alt="member.name"
            class="member-avatar"
          />
          <div class="member-info">
            <span class="member-name">{{ member.name }}</span>
            <span v-if="member.id === group.ownerId" class="member-role">群主</span>
          </div>
          <button
            v-if="group.ownerId === userInfo.info?.id && member.id !== group.ownerId"
            class="kick-btn"
            @click="handleKickMember(member)"
          >
            请出群组
          </button>
        </div>
      </template>
    </div>

    <!-- 确认对话框 -->
    <Teleport to="body">
      <div v-if="showConfirmDialog" class="modal-overlay" @click.self="showConfirmDialog = false">
        <div class="confirm-dialog">
          <h3>确认请出群组</h3>
          <p>确定要将 {{ selectedMember?.name }} 请出群组吗？</p>
          <div class="dialog-buttons">
            <button class="cancel-btn" @click="showConfirmDialog = false">取消</button>
            <button class="confirm-btn" @click="confirmKickMember">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import defaultAvatar from '@/assets/default-avatar.svg'
import { API_BASE_URL } from '@/config'
import { kickGroupMember } from '@/api/group'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userInfo = useUserStore()

interface GroupMember {
  id: number
  name: string
  avatar: string
}

interface Group {
  id: number
  groupNo: number
  name: string
  avatar: string
  ownerId: number
}

const props = defineProps<{
  members: GroupMember[]
  group: Group
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'retry'): void
  (e: 'refresh'): void
}>()

const searchQuery = ref('')
const showConfirmDialog = ref(false)
const selectedMember = ref<GroupMember | null>(null)

const filteredMembers = computed(() => {
  let members = [...props.members]

  // 将群主排在第一位
  members.sort((a, b) => {
    if (a.id === props.group.ownerId) return -1
    if (b.id === props.group.ownerId) return 1
    return 0
  })

  if (!searchQuery.value) {
    return members
  }

  const query = searchQuery.value.toLowerCase()
  return members.filter(member =>
    member.name.toLowerCase().includes(query)
  )
})

const handleKickMember = (member: GroupMember) => {
  selectedMember.value = member
  showConfirmDialog.value = true
}

const confirmKickMember = async () => {
  if (!selectedMember.value) return

  try {
    await kickGroupMember({
      group_id: props.group.id,
      user_id: selectedMember.value.id
    })
    showConfirmDialog.value = false
    emit('refresh')
  } catch (err: any) {
    ElMessage.error(err.message)
  }
}
</script>

<style scoped>
.member-list {
  width: 100%;
  max-height: 400px;
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

.members-container {
  overflow-y: auto;
  padding: 0.5rem;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

.error-state button:hover {
  background: var(--color-primary-dark);
}

.member-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  justify-content: space-between;
  gap: 1rem;
}

.member-item:hover {
  background-color: var(--color-background-soft);
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 1rem;
}

.member-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-role {
  font-size: 12px;
  color: var(--color-primary);
  margin-top: 2px;
  font-weight: 500;
}

.kick-btn {
  padding: 0.25rem 0.75rem;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.kick-btn:hover {
  background: #ff7875;
  transform: translateY(-1px);
}

.kick-btn:active {
  transform: translateY(0);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.confirm-dialog {
  background: var(--color-background);
  border-radius: 8px;
  padding: 1.5rem;
  width: 300px;
  max-width: 90vw;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.confirm-dialog h3 {
  margin: 0 0 1rem 0;
  font-size: 18px;
  color: var(--color-text);
}

.confirm-dialog p {
  margin: 0 0 1.5rem 0;
  color: var(--color-text-secondary);
}

.dialog-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
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
  background: #ff4d4f;
  color: white;
}

.cancel-btn:hover {
  background: #40a9ff;
}

.confirm-btn:hover {
  background: #ff7875;
}

.cancel-btn:active,
.confirm-btn:active {
  transform: translateY(1px);
}
</style>
