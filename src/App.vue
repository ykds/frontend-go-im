<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // 检查token是否存在
  const token = localStorage.getItem('token')
  if (!token && router.currentRoute.value.path !== '/login') {
    router.push('/login')
  }
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
