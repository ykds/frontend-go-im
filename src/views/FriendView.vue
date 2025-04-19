<template>
  <div class="friend-container">
    <div class="friend-content">
      <div class="nav-sidebar">
        <div class="nav-item" :class="{ active: currentPage === 'chats' }" @click="router.push('/chat')">
          <svg class="nav-icon" viewBox="0 0 24 24">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"/>
          </svg>
          <!-- <span class="nav-tooltip">聊天</span> -->
        </div>
        <div class="nav-item" :class="{ active: currentPage === 'friends' }" @click="currentPage = 'friends'">
          <svg class="nav-icon" viewBox="0 0 24 24">
            <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"/>
          </svg>
          <!-- <span class="nav-tooltip">好友</span> -->
        </div>
        <div class="nav-item" :class="{ active: currentPage === 'groups' }" @click="router.push('/group')">
          <svg class="nav-icon" viewBox="0 0 24 24">
            <path d="M12 12.75C8.83 12.75 6.25 10.17 6.25 7C6.25 3.83 8.83 1.25 12 1.25C15.17 1.25 17.75 3.83 17.75 7C17.75 10.17 15.17 12.75 12 12.75ZM12 2.75C9.66 2.75 7.75 4.66 7.75 7C7.75 9.34 9.66 11.25 12 11.25C14.34 11.25 16.25 9.34 16.25 7C16.25 4.66 14.34 2.75 12 2.75Z"/>
            <path d="M3.41 22.75C3.28 22.75 3.15 22.72 3.03 22.66C2.78 22.53 2.62 22.27 2.62 22V17C2.62 13.9 5.03 11.5 8.13 11.5H15.88C18.98 11.5 21.38 13.9 21.38 17V22C21.38 22.27 21.22 22.53 20.97 22.66C20.72 22.79 20.42 22.75 20.21 22.57L12 14.36L3.79 22.57C3.66 22.69 3.54 22.75 3.41 22.75Z"/>
          </svg>
          <!-- <span class="nav-tooltip">群组</span> -->
        </div>
        <div class="nav-item" :class="{ active: currentPage === 'profile' }" @click="currentPage = 'profile'">
          <svg class="nav-icon" viewBox="0 0 24 24">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
          </svg>
          <!-- <span class="nav-tooltip">个人</span> -->
        </div>
      </div>
      <div class="friend-list">
        <div class="list-header">
          <h2 class="list-title">好友列表</h2>
          <div class="header-actions">
            <el-button
              type="primary"
              size="small"
              circle
              @click="showSearchDialog = true"
            >
              <el-icon><Plus /></el-icon>
            </el-button>
            <el-button
              type="info"
              size="small"
              circle
              @click="showApplyDialog = true"
            >
              <el-icon><Bell /></el-icon>
            </el-button>
          </div>
        </div>
        <div v-if="friendStore.friends.length === 0" class="empty-state">
          <img src="@/assets/empty-friends.svg" alt="暂无好友" class="empty-image" />
          <p class="empty-text">暂无好友，快去添加吧</p>
        </div>
        <div v-else v-for="friend in friendStore.friends" :key="friend.userId"
             class="friend-item"
             @click="selectFriend(friend)"
             @dblclick="handleDoubleClick(friend)">
          <img :src="friend.avatar || defaultAvatar" :alt="friend.username" class="friend-avatar" />
          <span class="friend-name">{{ friend.username }}</span>
        </div>
      </div>
      <div class="friend-detail" :class="{ 'empty': !selectedFriend }">
        <FriendDetail v-if="selectedFriend" :friend="selectedFriend" @send-message="handleSendMessage" />
      </div>
    </div>
    <SearchUserDialog v-model="showSearchDialog" />
    <FriendApplyDialog v-model="showApplyDialog" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFriendStore } from '@/stores/friend'
import FriendDetail from '@/components/friend/FriendDetail.vue'
import defaultAvatar from '@/assets/default-avatar.svg'
import { useRouter } from 'vue-router'
import { Plus, Bell } from '@element-plus/icons-vue'
import SearchUserDialog from '@/components/friend/SearchUserDialog.vue'
import FriendApplyDialog from '@/components/friend/FriendApplyDialog.vue'

interface Friend {
  userId: string
  username: string
  avatar: string
}

const router = useRouter()
const friendStore = useFriendStore()
const currentPage = ref('friends')
const selectedFriend = ref<Friend | null>(null)
const showSearchDialog = ref(false)
const showApplyDialog = ref(false)

const selectFriend = (friend: Friend) => {
  selectedFriend.value = friend
}

const handleSendMessage = () => {
  if (selectedFriend.value) {
    router.push({
      name: 'chat-detail',
      params: {
        id: selectedFriend.value.userId
      },
      query: {
        kind: 'single',
      }
    })
  }
}

const handleDoubleClick = (friend: Friend) => {
  router.push({
    name: 'chat-detail',
    params: {
      id: friend.userId
    },
    query: {
      kind: 'single',
    }
  })
}

onMounted(() => {
  friendStore.fetchFriends()
})
</script>

<style scoped>
.friend-container {
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

.friend-content {
  display: flex;
  height: 80vh;
  width: 80vw;
  max-width: 1200px;
  background: var(--color-white);
  border-radius: 8px;
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

.friend-list {
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
  padding-bottom: 10px;
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
}

.header-actions {
  display: flex;
  gap: 8px;
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-bottom: 8px;
}

.friend-item:hover {
  background: var(--color-input-bg);
}

.friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  border: 2px solid var(--color-border);
}

.friend-name {
  font-size: 16px;
  color: var(--color-text);
}

.friend-detail {
  flex: 1;
  padding: 24px;
  display: flex;
  background: var(--color-white);
  border-left: 1px solid var(--color-border);
  min-height: 100%;
  width: 500px;
}

.friend-detail.empty {
  background: var(--color-background);
  border-left: 1px dashed var(--color-border);
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
  opacity: 0.6;
}

.empty-text {
  color: var(--color-text-secondary);
  font-size: 14px;
}
</style>
