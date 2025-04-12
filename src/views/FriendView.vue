<template>
  <div class="friend-container">
    <div class="friend-content">
      <div class="friend-list">
        <h2 class="list-title">好友列表</h2>
        <div v-if="friendStore.friends.length === 0" class="empty-state">
          <img src="@/assets/empty-friends.svg" alt="暂无好友" class="empty-image" />
          <p class="empty-text">暂无好友，快去添加吧</p>
        </div>
        <div v-else v-for="friend in friendStore.friends" :key="friend.userId" class="friend-item" @click="selectFriend(friend)">
          <img :src="friend.avatar" :alt="friend.username" class="friend-avatar" />
          <span class="friend-name">{{ friend.username }}</span>
        </div>
      </div>
      <div class="friend-detail" :class="{ 'empty': !selectedFriend }">
        <FriendDetail v-if="selectedFriend" :friend="selectedFriend" @send-message="handleSendMessage" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFriendStore } from '@/stores/friend'
import FriendDetail from '@/components/friend/FriendDetail.vue'

interface Friend {
  userId: string
  username: string
  avatar: string
}


const friendStore = useFriendStore()
const selectedFriend = ref<Friend | null>(null)

const selectFriend = (friend: Friend) => {
  selectedFriend.value = friend
}

const handleSendMessage = () => {
  // TODO: 实现发送消息逻辑
  console.log('发送消息给:', selectedFriend.value?.username)
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

.friend-list {
  width: 240px;
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  padding: 16px;
  background: var(--color-white);
}

.list-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border);
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
