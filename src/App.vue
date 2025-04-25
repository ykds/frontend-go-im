<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useFriendStore } from '@/stores/friend'
import { useGroupStore } from '@/stores/group'
import { useUserStore } from '@/stores/user'

const authStore = useAuthStore()
const chatStore = useChatStore()
const friendStore = useFriendStore()
const groupStore = useGroupStore()
const userStore = useUserStore()

const router = useRouter()

const clearData = () => {
   // 清空所有store数据
  authStore.token = null
  authStore.user = null

  // 清空聊天数据
  chatStore.sessions = []
  chatStore.sessionMap = new Map()
  chatStore.currentSessionId = null

  // 清空好友数据
  friendStore.friends = []
  friendStore.friendMap = {}

  // 清空群组数据
  groupStore.groups = []
  groupStore.groupMap = {}
  groupStore.memberMap = {}

  // 清除本地存储
  localStorage.clear()
}

onMounted(() => {
  // 检查token是否存在
  const token = localStorage.getItem('token')
  if (!token && router.currentRoute.value.path !== '/login') {
    router.push('/login')
  }

  // 添加浏览器关闭事件监听
  window.addEventListener('beforeunload', clearData)
})

onBeforeUnmount(() => {
  // 移除事件监听
  window.removeEventListener('beforeunload', clearData)
})
</script>

<template>
  <RouterView />
</template>

<style>
:root {
  --color-background: #f8fafc;
  --color-text: #1e293b;
  --color-primary: #667eea;
  --color-primary-dark: #5a6fd5;
  --color-secondary: #764ba2;
  --color-border: #e2e8f0;
  --color-input-bg: #f8fafc;
  --color-white: #ffffff;
  --section-gap: 160px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: var(--color-text);
  background: var(--color-background);
  line-height: 1.6;
  font-size: 16px;
}

#app {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
