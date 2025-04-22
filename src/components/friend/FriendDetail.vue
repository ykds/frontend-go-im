<template>
  <div class="friend-detail">
    <img :src="friend.avatar?'http://localhost:8080'+friend.avatar : defaultAvatar" :alt="friend.username" class="avatar" />
    <h2>{{ friend.username }}</h2>
    <!-- <p v-if="friend.remark">备注: {{ friend.remark }}</p> -->
    <!-- <p>性别: {{ friend.gender === 1 ? '男' : '女' }}</p> -->
    <button @click="$emit('send-message')">发送消息</button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import defaultAvatar from '@/assets/default-avatar.svg'

interface Friend {
  userId: number
  username: string
  avatar: string
  // remark?: string
  // gender: number
}

const props = defineProps<{
  friend: Friend
}>()

const emit = defineEmits<{
  (e: 'send-message'): void
}>()

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
  gap: 1rem;
  padding: 2rem;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
}

button {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
