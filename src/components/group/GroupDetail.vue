<template>
  <div class="group-detail">
    <img :src="group.avatar ? API_BASE_URL + group.avatar : defaultAvatar" :alt="group.name" class="avatar" />
    <h2>{{ group.name }}</h2>
    <p>群号: {{ group.groupNo }}</p>
    <p>群成员: {{ members.length }}人</p>

    <div class="button-group">
      <button @click="$emit('send-message')">发送消息</button>
      <button @click="handleShowMembers">查看群成员</button>
      <button @click="showInviteDialog = true">邀请成员</button>
      <button v-if="group.ownerId !== userInfo.info?.id" class="leave-btn" @click="showLeaveConfirm = true">退出群组</button>
      <button v-if="group.ownerId === userInfo.info?.id" class="dismiss-btn" @click="showDismissConfirm = true">解散群组</button>
    </div>

    <Teleport to="body">
      <div v-if="showMembers" class="modal-overlay" @click.self="showMembers = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>群成员列表</h3>
            <button class="close-btn" @click="showMembers = false">×</button>
          </div>
          <GroupMemberList
            :members="members"
            :group=group
            :error="error"
            @retry="loadMembers"
            @refresh="loadMembers"
          />
        </div>
      </div>

      <!-- 邀请成员对话框 -->
      <div v-if="showInviteDialog" class="modal-overlay" @click.self="showInviteDialog = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>邀请成员</h3>
            <button class="close-btn" @click="showInviteDialog = false">×</button>
          </div>
          <InviteMembers
            :groupId="group.id"
            :members="members"
            @close="showInviteDialog = false"
            @refresh="loadMembers"
          />
        </div>
      </div>

      <!-- 退出群组确认框 -->
      <div v-if="showLeaveConfirm" class="modal-overlay" @click.self="showLeaveConfirm = false">
        <div class="confirm-dialog">
          <h3>确认退出群组</h3>
          <p>确定要退出 {{ group.name }} 吗？</p>
          <div class="dialog-buttons">
            <button class="cancel-btn" @click="showLeaveConfirm = false">取消</button>
            <button class="confirm-btn" @click="handleLeaveGroup">确定</button>
          </div>
        </div>
      </div>

      <!-- 解散群组确认框 -->
      <div v-if="showDismissConfirm" class="modal-overlay" @click.self="showDismissConfirm = false">
        <div class="confirm-dialog">
          <h3>确认解散群组</h3>
          <p>确定要解散 {{ group.name }} 吗？解散后群组将被永久删除，所有成员将被移出群组。</p>
          <div class="dialog-buttons">
            <button class="cancel-btn" @click="showDismissConfirm = false">取消</button>
            <button class="confirm-btn" @click="handleDismissGroup">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, onMounted } from 'vue'
import defaultAvatar from '@/assets/default-avatar.svg'
import { API_BASE_URL } from '@/config'
import GroupMemberList from './GroupMemberList.vue'
import InviteMembers from './InviteMembers.vue'
import { getGroupMembers, leaveGroup, dismissGroup } from '@/api/group'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userInfo = useUserStore()

interface Group {
  id: number
  groupNo: number
  name: string
  avatar: string
  ownerId: number
}

interface GroupMember {
  id: number
  name: string
  avatar: string
}

const props = defineProps<{
  group: Group
}>()

const emit = defineEmits<{
  (e: 'send-message'): void
  (e: 'refresh'): void
}>()

const showMembers = ref(false)
const showInviteDialog = ref(false)
const showLeaveConfirm = ref(false)
const showDismissConfirm = ref(false)
const members = ref<GroupMember[]>([])
const error = ref<string | null>(null)

const loadMembers = async () => {
  try {
    error.value = null
    const response = await getGroupMembers({group_id: props.group.id})
    members.value = response.members?response.members : []
  } catch (err) {
    error.value = '加载群成员失败，请重试'
    // console.error('Failed to load group members:', err)
  }
}

const handleShowMembers = async () => {
  showMembers.value = true
}

const handleLeaveGroup = async () => {
  try {
    await leaveGroup({ group_id: props.group.id })
    showLeaveConfirm.value = false
    ElMessage.success('退出群组成功')
    emit('refresh')
  } catch (err: any) {
    ElMessage.error(err.message)
  }
}

const handleDismissGroup = async () => {
  try {
    await dismissGroup({ group_id: props.group.id })
    showDismissConfirm.value = false
    ElMessage.success('解散群组成功')
    emit('refresh')
  } catch (err: any) {
    ElMessage.error(err.message)
  }
}

onMounted(async () => {
  if (members.value.length === 0) {
    await loadMembers()
  }
})
</script>

<style scoped>
.group-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  width: 100%;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.avatar:hover {
  transform: scale(1.05);
}

h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0.5rem 0;
}

p {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 0.25rem 0;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

.leave-btn {
  background: #ff4d4f;
}

.leave-btn:hover {
  background: #ff7875;
}

.dismiss-btn {
  background: #ff4d4f;
}

.dismiss-btn:hover {
  background: #ff7875;
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

.modal-content {
  background: var(--color-background);
  border-radius: 12px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  color: var(--color-text);
}

.close-btn:hover {
  color: var(--color-text-secondary);
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
