<template>
  <div class="chat-container">
    <div class="chat-content" :class="{ 'loading': loading }">
      <div class="nav-sidebar">
        <div class="nav-item" :class="{ active: currentPage === 'chats' }" @click="currentPage = 'chats'">
          <svg class="nav-icon" viewBox="0 0 24 24">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"/>
          </svg>
          <!-- <span class="nav-tooltip">聊天</span> -->
        </div>
        <div class="nav-item" :class="{ active: currentPage === 'friends' }" @click="navigateTo('friend')">
          <svg class="nav-icon" viewBox="0 0 24 24">
            <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"/>
          </svg>
          <!-- <span class="nav-tooltip">好友</span> -->
        </div>
        <div class="nav-item" :class="{ active: currentPage === 'groups' }" @click="navigateTo('group')">
          <svg class="nav-icon" viewBox="0 0 24 24">
            <path d="M12 12.75C8.83 12.75 6.25 10.17 6.25 7C6.25 3.83 8.83 1.25 12 1.25C15.17 1.25 17.75 3.83 17.75 7C17.75 10.17 15.17 12.75 12 12.75ZM12 2.75C9.66 2.75 7.75 4.66 7.75 7C7.75 9.34 9.66 11.25 12 11.25C14.34 11.25 16.25 9.34 16.25 7C16.25 4.66 14.34 2.75 12 2.75Z"/>
            <path d="M3.41 22.75C3.28 22.75 3.15 22.72 3.03 22.66C2.78 22.53 2.62 22.27 2.62 22V17C2.62 13.9 5.03 11.5 8.13 11.5H15.88C18.98 11.5 21.38 13.9 21.38 17V22C21.38 22.27 21.22 22.53 20.97 22.66C20.72 22.79 20.42 22.75 20.21 22.57L12 14.36L3.79 22.57C3.66 22.69 3.54 22.75 3.41 22.75Z"/>
          </svg>
          <!-- <span class="nav-tooltip">群组</span> -->
        </div>
        <div class="nav-item" :class="{ active: currentPage === 'profile' }" @click="router.push('/profile')">
          <svg class="nav-icon" viewBox="0 0 24 24">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
          </svg>
          <!-- <span class="nav-tooltip">个人</span> -->
        </div>
      </div>
      <div class="chat-list">
        <div class="list-header">
          <h2 class="list-title">会话列表</h2>
        </div>
        <div v-if="chatStore.sessions.length === 0" class="empty-state">
          <img src="@/assets/empty-chats.svg" alt="暂无会话" class="empty-image" />
          <p class="empty-text">暂无会话，快去和好友聊天吧</p>
        </div>
        <div v-else v-for="session in chatStore.sessions" :key="session.sessionId"
             class="chat-item"
             :class="{ active: selectedSession?.sessionId === session.sessionId }"
             @click="selectSession(session)">
          <img v-if="session.kind === 'single'" :src="session.friendAvatar?'http://localhost:8080' + session.friendAvatar : defaultAvatar" class="chat-avatar" />
          <img v-if="session.kind === 'group'" :src="session.groupAvatar?'http://localhost:8080' + session.groupAvatar :  defaultAvatar" class="chat-avatar" />
          <div class="chat-info">
            <span v-if="session.kind === 'single'" class="chat-name">{{ session.friendName }}</span>
            <span v-if="session.kind === 'group'" class="chat-name">{{ session.groupName }}</span>
            <span class="chat-preview">{{ session.lastMessage }}</span>
          </div>
        </div>
      </div>
      <div class="chat-box" :class="{ 'empty': !selectedSession }">
        <div v-if="selectedSession" class="chat-box-content">
          <div class="chat-header">
            <span v-if="selectedSession.kind === 'single'" class="chat-title">{{ selectedSession.friendName }}</span>
            <span v-if="selectedSession.kind === 'group'" class="chat-title">{{ selectedSession.groupName }}</span>
          </div>
          <div class="message-list" ref="messageListRef">
            <div v-for="message in selectedSession.messages" :key="message.id"
                 class="message-item"
                 :class="{ 'message-self': message.isSelf }">
              <img :src="message.avatar?'http://localhost:8080'+message.avatar : defaultAvatar" :alt="message.sender" class="message-avatar" />
              <div class="message-content">
                <span class="message-sender">{{ message.sender }}</span>
                <div class="message-bubble">{{ message.content }}</div>
              </div>
            </div>
          </div>
          <div class="message-input">
            <input type="text" v-model="newMessage" placeholder="输入消息..." @keyup.enter="sendMsg" />
            <button @click="sendMsg">发送</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { sendMessage, getSeq } from '@/api/chat'
import wsClient from '@/utils/websocket'

import defaultAvatar from '@/assets/default-avatar.svg'

interface Session {
  sessionId: number
	kind:         string
	groupId:      number
	groupName:    string
	groupAvatar:    string
	friendId:    number
	friendName:    string
	friendAvatar: string
	seq:          number

  messages: Message[]
  lastMessage: string
  offset: number
}

interface Message {
  id: number
  sender: string
  content: string
  avatar: string
  isSelf: boolean
}

const router = useRouter()
const route = useRoute()
const chatStore = useChatStore()
const userStore = useUserStore()

const currentPage = ref('chats')
const selectedSession = ref<Session | null>(null)
const newMessage = ref('')
const loading = ref(true)
const messageListRef = ref<HTMLElement | null>(null)

const navigateTo = (route: string) => {
  router.push(`/${route}`)
}

const selectSession = (session: Session) => {
  selectedSession.value = session
  chatStore.setCurrentSession(session.sessionId)
}

interface AckMessage {
	type: number
  kind: string
	sessionId: number
	id: number
	seq: number
}



const sendMsg = async () => {
  if (!newMessage.value.trim() || !selectedSession.value) return

  try {
      let toid = selectedSession.value.friendId
      if (selectedSession.value.kind === 'group') {
        toid = selectedSession.value.groupId
      }
      const seq = await getSeq({
        to_id: toid,
        kind: selectedSession.value.kind
      })
      await sendMessage({
          kind: selectedSession.value.kind,
          toId: toid,
          message: newMessage.value,
          seq: seq
        }, {
          to_id: toid,
          kind: selectedSession.value.kind
        })
    const message: Message = {
      id: 0,
      sender: userStore.info?.username as string,
      content: newMessage.value,
      avatar:  userStore.info?.avatar as string,
      isSelf: true
    }
    selectedSession.value.messages.push(message)
    selectedSession.value.lastMessage = newMessage.value
    newMessage.value = ''

    if (selectedSession.value.kind === 'group') {
      const ackMessage: AckMessage = {
        type: 6,
        kind: selectedSession.value.kind,
        sessionId: selectedSession.value.sessionId,
        id: 0,
        seq: seq
      }
      wsClient.send({
        type: 1,
        content: JSON.stringify(ackMessage)
      })
      selectedSession.value.offset = seq + 1
    }
  } catch(error) {
    console.error('发送消息失败:', error)
  }
}

const scrollToBottom = () => {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

// 监听消息列表变化
watch(() => selectedSession.value?.messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

// 监听会话切换
watch(() => selectedSession.value, () => {
  nextTick(() => {
    scrollToBottom()
  })
})


// 监听路由参数变化
watch(() => route.params.id, async (newId) => {
  if (newId) {
    const session = chatStore.sessionMap.get(Number(newId))
    if (session) {
      selectSession(session)
    }
  }
}, { immediate: true })

// 组件挂载时初始化
onMounted(async () => {
  // 如果有路由参数，选择对应会话
  if (route.params.id) {
    const session = chatStore.sessionMap.get(Number(route.params.id))
    if (session) {
      selectSession(session)
    }
  }
})

</script>

<style scoped>
.chat-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.chat-content {
  display: flex;
  height: 80vh;
  width: 80vw;
  max-width: 1200px;
  background: var(--color-white);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.nav-sidebar {
  width: 60px;
  background: var(--color-background);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
}

.nav-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item:hover {
  background: var(--color-input-bg);
}

.nav-item.active {
  background: var(--color-primary);
}

.nav-item.active .nav-icon {
  fill: var(--color-white);
}

.nav-icon {
  width: 24px;
  height: 24px;
  fill: var(--color-text-secondary);
}

.nav-tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: var(--color-text);
  color: var(--color-white);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  margin-left: 8px;
}

.nav-tooltip::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: transparent var(--color-text) transparent transparent;
}

.nav-item:hover .nav-tooltip {
  opacity: 1;
  visibility: visible;
  margin-left: 12px;
}

.chat-list {
  width: 240px;
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  padding: 16px;
  background: var(--color-white);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
  min-width: 0;
}

.list-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  white-space: nowrap;
  margin-right: 8px;
  margin-bottom: 3px;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 11px;
  padding-left: 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-bottom: 8px;
}

.chat-item:hover {
  background: var(--color-input-bg);
}

.chat-item.active {
  background: var(--color-primary-light);
}

.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  border: 2px solid var(--color-border);
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-name {
  font-size: 16px;
  color: var(--color-text);
  display: block;
  margin-bottom: 4px;
}

.chat-preview {
  font-size: 14px;
  color: var(--color-text-secondary);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-box {
  flex: 1;
  display: flex;
  background: var(--color-white);
  border-left: 1px solid var(--color-border);
  min-height: 100%;
  width: 100%;
}

.chat-box.empty {
  background: var(--color-background);
  border-left: 1px dashed var(--color-border);
}

.chat-box-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.chat-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-white);
}

.chat-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: var(--color-background);
}

.message-item {
  display: flex;
  margin-bottom: 16px;
}

.message-item.message-self {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin: 0 8px;
}

.message-content {
  max-width: 60%;
}

.message-sender {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
  display: block;
}

.message-bubble {
  background: var(--color-input-bg);
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  color: var(--color-text);
}

.message-self .message-bubble {
  background: var(--color-primary);
  color: var(--color-white);
}

.message-input {
  padding: 16px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 8px;
  background: var(--color-white);
}

.message-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 14px;
}

.message-input button {
  padding: 8px 16px;
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.message-input button:hover {
  background: var(--color-primary-dark);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  text-align: center;
}

.empty-image {
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-primary);
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 16px;
  color: var(--color-text);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.chat-content.loading {
  position: relative;
  overflow: hidden;
}
</style>
