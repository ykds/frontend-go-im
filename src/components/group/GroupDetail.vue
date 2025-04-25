<template>
  <div class="group-detail">
    <img :src="group.avatar ? API_BASE_URL + group.avatar : defaultAvatar" :alt="group.name" class="avatar" />
    <h2>{{ group.name }}</h2>
    <p>群号: {{ group.groupNo }}</p>
    <!-- <p>群成员: {{ group.memberCount }}人</p> -->
    <button @click="$emit('send-message')">发送消息</button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import defaultAvatar from '@/assets/default-avatar.svg'
import { API_BASE_URL } from '@/config'
interface Group {
  id: number
  groupNo: number
  name: string
  avatar: string
}


const props = defineProps<{
  group: Group
}>()

const emit = defineEmits<{
  (e: 'send-message'): void
}>()
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

button {
  margin-top: 1rem;
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
</style>
