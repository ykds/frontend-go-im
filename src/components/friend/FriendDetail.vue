<template>
  <div class="friend-detail">
    <img :src="friend.avatar?API_BASE_URL+friend.avatar : defaultAvatar" :alt="friend.username" class="avatar" />
    <div class="username-section">
      <h2 v-if="friend.remark">{{ friend.remark }}</h2>
      <h2 v-else>{{ friend.username }}</h2>
      <div class="gender-badge" :class="friend.gender">
        <el-icon>
          <svg v-if="friend.gender === 'male'" viewBox="0 0 24 24">
            <path d="M9,9C10.29,9 11.5,9.41 12.47,10.11L17.58,5H13V3H21V11H19V6.41L13.89,11.5C14.59,12.5 15,13.7 15,15A6,6 0 0,1 9,21A6,6 0 0,1 3,15A6,6 0 0,1 9,9M9,11A4,4 0 0,0 5,15A4,4 0 0,0 9,19A4,4 0 0,0 13,15A4,4 0 0,0 9,11Z" />
          </svg>
          <svg v-else viewBox="0 0 24 24">
            <path d="M12,4A6,6 0 0,1 18,10C18,12.97 15.84,15.44 13,15.92V18H15V20H13V22H11V20H9V18H11V15.92C8.16,15.44 6,12.97 6,10A6,6 0 0,1 12,4M12,6A4,4 0 0,0 8,10A4,4 0 0,0 12,14A4,4 0 0,0 16,10A4,4 0 0,0 12,6Z" />
          </svg>
        </el-icon>
      </div>
    </div>
    <div class="friend-actions">
      <button class="send-message-btn" @click="$emit('send-message')">发送消息</button>
      <button class="delete-friend-btn" @click="showConfirmDialog = true">删除好友</button>
    </div>
  </div>

  <!-- 确认对话框 -->
  <Teleport to="body">
    <div v-if="showConfirmDialog" class="modal-overlay" @click.self="showConfirmDialog = false">
      <div class="confirm-dialog">
        <h3>确认删除好友</h3>
        <p>确定要删除好友 {{ friend.username }} 吗？</p>
        <div class="dialog-buttons">
          <button class="cancel-btn" @click="showConfirmDialog = false">取消</button>
          <button class="confirm-btn" @click="handleDeleteFriend">确定</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { defineProps, defineEmits } from 'vue'
import defaultAvatar from '@/assets/default-avatar.svg'
import { API_BASE_URL } from '@/config'
import { deleteFriend } from '@/api/user'
import { ElMessage } from 'element-plus'

interface Friend {
  userId: number
  username: string
  avatar: string
  remark: string
  gender: string
}

const props = defineProps<{
  friend: Friend
}>()

const emit = defineEmits<{
  (e: 'send-message'): void
  (e: 'refresh'): void
}>()

const showConfirmDialog = ref(false)

const handleDeleteFriend = async () => {
  try {
    await deleteFriend({
      friendId: props.friend.userId
    })
    showConfirmDialog.value = false
    ElMessage.success('删除好友成功')
    emit('refresh')
  } catch (err: any) {
    ElMessage.error(err.message)
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.friend-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem;
  min-height: 100%;
  width: 100%;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  object-fit: cover;
}

.username-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.friend-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
  width: 100%;
}

.send-message-btn,
.delete-friend-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 120px;
  text-align: center;
}

.send-message-btn {
  background: var(--color-primary);
  color: white;
}

.send-message-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.delete-friend-btn {
  background: #ff4d4f;
  color: white;
}

.delete-friend-btn:hover {
  background: #ff7875;
  transform: translateY(-1px);
}

.send-message-btn:active,
.delete-friend-btn:active {
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
  text-align: center;
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
  transform: translateY(-1px);
}

.confirm-btn:hover {
  background: #ff7875;
  transform: translateY(-1px);
}

.cancel-btn:active,
.confirm-btn:active {
  transform: translateY(0);
}

.gender-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  padding: 4px;
  background-color: var(--color-background);
}

.gender-badge.male {
  background-color: #409EFF;
  color: #fff;
}

.gender-badge.female {
  background-color: #FF69B4;
  color: #fff;
}

.gender-badge svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}
</style>
