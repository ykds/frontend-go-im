<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo-container">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <input
            type="text"
            v-model="username"
            placeholder="请输入账号"
            class="input-field"
            :disabled="loading"
            required
          />
        </div>
        <div class="input-group">
          <input
            type="password"
            v-model="password"
            placeholder="请输入密码"
            class="input-field"
            :disabled="loading"
            required
          />
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <div class="register-link">
          还没有账号？<a @click="router.push('/register')">立即注册</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useFriendStore } from '@/stores/friend'
import { useUserStore } from '@/stores/user'
import { useGroupStore } from '@/stores/group'
import { listMessage, sendMessage, ackMessage } from '@/api/chat'
import wsClient from '@/utils/websocket'

import defaultAvatar from '@/assets/default-avatar.svg'
import { mapState } from 'pinia'


const chatStore = useChatStore()
const friendStore = useFriendStore()
const groupStore = useGroupStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const router = useRouter()

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = null
    const token = await authStore.login({
      phone: username.value,
      password: password.value
    })
    // 保存token
    localStorage.setItem('token', token)
    initData()
    router.push('/chat')
  } catch (err) {
    error.value = authStore.error || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}

interface pollMessage {
  session_id: number
  kind: string
  seq: number
}

interface newMessageNotify {
  kind: string
  session_id: number
  seq: number
  toId: number
}

interface newMessage {
  type: number
  data: string
}

interface Body {
	id: number
  session_id: number
	from_id: number
	content: string
	seq: number
	kind: string
	createdAt: number
}

interface AckMessage {
	type: number
  kind?: string
	sessionId?: number
	id?: number
	seq?: number
  ack_id?: number
}


// 初始化数据
const initData = async () => {
  try {
    loading.value = true
    // 获取好友列表
    await friendStore.fetchFriends()
    // 获取群组列表
    await groupStore.fetchGroups()
    // 获取会话列表
    await chatStore.fetchSessions()

    await userStore.fetchUserInfo()

    // 获取消息
    chatStore.sessions.forEach(async session => {
        let maxSeq = 0;
        const response = await listMessage({
          fromId: session.friendId,
          groupId: session.groupId,
          seq: session.offset,
          kind: session.kind
        })

        response.list.forEach(item => {
          let sender = ""
          let avatar = ""
          if (item.kind === 'single') {
            sender = friendStore.friendMap[item.fromId]?.username || '未知'
            avatar = friendStore.friendMap[item.fromId]?.avatar || defaultAvatar
          } else if (item.kind === 'group') {
            sender = groupStore.memberMap[session.groupId][item.fromId]?.name || '未知'
            avatar = groupStore.memberMap[session.groupId][item.fromId]?.avatar || defaultAvatar
          }
          session.messages.push({
            id: item.id,
            content: item.content,
            isSelf: false,
            sender: sender,
            avatar: avatar,
          })
          if (item.seq > maxSeq) {
            maxSeq = item.seq
          }
        })
        if (maxSeq > 0) {
          ackMessage({
              sessionId: session.sessionId,
              seq: maxSeq
            })
          session.offset = maxSeq+1
        }
    })
    // 连接websocket
    wsClient.connect()

    // 监听新消息通知
    wsClient.addGlobalCallback(4, async (content: string, ackId: number|undefined) => {
        const ackMessage: AckMessage = {
          type: 4,
          ack_id: ackId,
        }
        wsClient.send({
          type: 1,
          data: JSON.stringify(ackMessage)
        })

        const notify: newMessageNotify = JSON.parse(content)
        let session
        if(notify.kind === 'group') {
          if (!(chatStore.gsMap instanceof Map)) {
            chatStore.gsMap = new Map()
          }
          let sessionId = chatStore.gsMap.get(notify.toId)
          session = chatStore.sessionMap.get(sessionId as number)
        } else if (notify.kind === 'single') {
          session = chatStore.sessionMap.get(notify.session_id)
        }
        if (!session) {
          await chatStore.fetchSessions()
          session = chatStore.sessionMap.get(notify.session_id)
        }
        const req: pollMessage = {
          session_id: notify.session_id,
          kind: notify.kind,
          seq: session?.offset || 0
        }
        wsClient.send({
          type: 3,
          data: JSON.stringify(req),
        })
    })

    // 监听消息通知
    wsClient.addGlobalCallback(3, (content: string, ackId: number|undefined) => {
        const msgs: newMessage[] = JSON.parse(content)
        let maxSeq = 0
        let sessionId = 0
        let kind = ""
        msgs.forEach(msg => {
          const body: Body = JSON.parse(msg.data)
          sessionId = body.session_id
          kind = body.kind

          let session
          let sender = ""
          let avatar = ""
          if(kind === 'group') {
            if (!(chatStore.gsMap instanceof Map)) {
              chatStore.gsMap = new Map()
            }
            session = chatStore.sessionMap.get(sessionId)
            sender = groupStore.memberMap[session?.groupId as number][body.from_id]?.name || '未知'
            avatar = groupStore.memberMap[session?.groupId as number][body.from_id]?.avatar || defaultAvatar
          } else if (kind === 'single') {
            session = chatStore.sessionMap.get(sessionId)
            sender = friendStore.friendMap[body.from_id]?.username || '未知'
            avatar = friendStore.friendMap[body.from_id]?.avatar || defaultAvatar
          }

          if (session) {
            session.messages.push({
              id: body.id,
              content: body.content,
              isSelf: false,
              sender: sender,
              avatar: avatar,
            })
            session.lastMessage = body.content
            if (body.seq > maxSeq) {
              maxSeq = body.seq
            }

            session.offset = maxSeq+1
          }
        })

        const ackMessage: AckMessage = {
            type: 3,
            kind: kind,
            id: sessionId,
            seq: maxSeq,
          }
        wsClient.send({
          type: 1,
          data: JSON.stringify(ackMessage),
        })
    })

    // 新的好友申请
    wsClient.addGlobalCallback(5, async (content: string, ackId: number|undefined) => {
      const ackMessage: AckMessage = {
          type: 5,
          ack_id: ackId,
        }
        wsClient.send({
          type: 1,
          data: JSON.stringify(ackMessage),
          ack_id: ackId,
        })
      friendStore.hasUnreadFriendApply = true
    })
    // 好友申请已处理
    wsClient.addGlobalCallback(6, async (content: string, ackId: number|undefined) => {
      const ackMessage: AckMessage = {
          type: 6,
          ack_id: ackId,
        }
        wsClient.send({
          type: 1,
          data: JSON.stringify(ackMessage),
          ack_id: ackId,
        })
      await friendStore.fetchFriends()
    })
    wsClient.addGlobalCallback(7, async (content: string, ackId: number|undefined) => {
      const ackMessage: AckMessage = {
          type: 7,
          ack_id: ackId,
        }
        wsClient.send({
          type: 1,
          data: JSON.stringify(ackMessage),
          ack_id: ackId,
        })
      await friendStore.fetchFriends()
    })
    // 新的群申请
    wsClient.addGlobalCallback(8, async (content: string, ackId: number|undefined) => {
      const ackMessage: AckMessage = {
          type: 8,
          ack_id: ackId,
        }
        wsClient.send({
          type: 1,
          data: JSON.stringify(ackMessage),
          ack_id: ackId,
        })
      groupStore.hasUnreadGroupApply = true
    })
    // 群申请已处理
    wsClient.addGlobalCallback(9, async (content: string, ackId: number|undefined) => {
      const ackMessage: AckMessage = {
          type: 9,
          ack_id: ackId,
        }
        wsClient.send({
          type: 1,
          data: JSON.stringify(ackMessage),
          ack_id: ackId,
        })
      await groupStore.fetchGroups()
      await chatStore.fetchSessions()
    })
    wsClient.addGlobalCallback(10, async (content: string, ackId: number|undefined) => {
      const ackMessage: AckMessage = {
          type: 10,
          ack_id: ackId,
        }
        wsClient.send({
          type: 1,
          data: JSON.stringify(ackMessage),
          ack_id: ackId,
        })
      await groupStore.fetchGroups()
      await chatStore.fetchSessions()
    })
    wsClient.addGlobalCallback(11, async (content: string, ackId: number|undefined) => {
      const ackMessage: AckMessage = {
          type: 11,
          ack_id: ackId,
        }
        wsClient.send({
          type: 1,
          data: JSON.stringify(ackMessage),
          ack_id: ackId,
        })
      await groupStore.fetchGroups()
      await chatStore.fetchSessions()
    })
    wsClient.addGlobalCallback(12, async (content: string, ackId: number|undefined) => {
      const ackMessage: AckMessage = {
          type: 12,
          ack_id: ackId,
        }
        wsClient.send({
          type: 1,
          data: JSON.stringify(ackMessage),
          ack_id: ackId,
        })
      await groupStore.fetchGroups()
    })

  } catch (error) {
    console.error('初始化数据失败:', error)
    throw error
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.login-container {
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

.login-box {
  background: rgba(255, 255, 255, 0.95);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  backdrop-filter: blur(8px);
  margin: 0 20px;
}

.logo-container {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo {
  width: 120px;
  height: auto;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  position: relative;
}

.input-field {
  width: 100%;
  padding: 14px 20px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: var(--color-input-bg);
  color: var(--color-text);
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-field::placeholder {
  color: #94a3b8;
}

.login-button {
  background: var(--color-primary);
  color: var(--color-white);
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.login-button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.login-button:active {
  transform: translateY(0);
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  text-align: center;
  margin-top: 0.5rem;
}

.login-button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

.login-button:disabled:hover {
  transform: none;
  box-shadow: none;
}

.input-field:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.register-link a {
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-box {
    padding: 2rem;
  }

  .input-field {
    padding: 12px 16px;
  }

  .login-button {
    padding: 12px 20px;
  }
}
</style>
