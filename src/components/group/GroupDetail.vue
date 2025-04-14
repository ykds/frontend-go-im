<template>
  <div class="group-detail">
    <img :src="group.avatar || defaultAvatar" :alt="group.name" class="avatar" />
    <h2>{{ group.name }}</h2>
    <!-- <p>群成员: {{ group.memberCount }}人</p> -->
    <button @click="$emit('send-message')">发送消息</button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import defaultAvatar from '@/assets/default-avatar.svg'

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
