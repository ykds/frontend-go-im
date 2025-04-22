<template>
  <div class="profile-container">
    <div class="profile-content">
      <div class="nav-sidebar">
        <div class="nav-item" :class="{ active: currentPage === 'chats' }" @click="router.push('/chat')">
          <svg class="nav-icon" viewBox="0 0 24 24">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"/>
          </svg>
        </div>
        <div class="nav-item" :class="{ active: currentPage === 'friends' }" @click="router.push('/friend')">
          <svg class="nav-icon" viewBox="0 0 24 24">
            <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"/>
          </svg>
        </div>
        <div class="nav-item" :class="{ active: currentPage === 'groups' }" @click="router.push('/group')">
          <svg class="nav-icon" viewBox="0 0 24 24">
            <path d="M12 12.75C8.83 12.75 6.25 10.17 6.25 7C6.25 3.83 8.83 1.25 12 1.25C15.17 1.25 17.75 3.83 17.75 7C17.75 10.17 15.17 12.75 12 12.75ZM12 2.75C9.66 2.75 7.75 4.66 7.75 7C7.75 9.34 9.66 11.25 12 11.25C14.34 11.25 16.25 9.34 16.25 7C16.25 4.66 14.34 2.75 12 2.75Z"/>
            <path d="M3.41 22.75C3.28 22.75 3.15 22.72 3.03 22.66C2.78 22.53 2.62 22.27 2.62 22V17C2.62 13.9 5.03 11.5 8.13 11.5H15.88C18.98 11.5 21.38 13.9 21.38 17V22C21.38 22.27 21.22 22.53 20.97 22.66C20.72 22.79 20.42 22.75 20.21 22.57L12 14.36L3.79 22.57C3.66 22.69 3.54 22.75 3.41 22.75Z"/>
          </svg>
        </div>
        <div class="nav-item" :class="{ active: currentPage === 'profile' }" @click="currentPage = 'profile'">
          <svg class="nav-icon" viewBox="0 0 24 24">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
          </svg>
        </div>
      </div>
      <div class="profile-info">
        <div class="profile-header">
          <h2 class="profile-title">个人信息</h2>
          <el-button
            v-if="!isEditing"
            type="primary"
            size="small"
            @click="isEditing = true"
          >
            编辑
          </el-button>
        </div>
        <div class="profile-body">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <el-upload
                v-if="isEditing"
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
              >
                <img :src="userInfo.avatar ? 'http://localhost:8080' + userInfo.avatar : defaultAvatar" class="profile-avatar" />
                <div class="upload-overlay">
                  <el-icon class="upload-icon"><Plus /></el-icon>
                </div>
              </el-upload>
              <img
                v-else
                :src="userInfo.avatar ? 'http://localhost:8080' + userInfo.avatar : defaultAvatar"
                class="profile-avatar"
              />
            </div>
          </div>
          <div class="username-section">
            <div class="edit-fields" v-if="isEditing">
              <el-input
                v-model="editForm.username"
                placeholder="请输入用户名"
                size="large"
              />
              <el-select v-model="editForm.gender" placeholder="请选择性别" size="large">
                <el-option label="男" value="male" />
                <el-option label="女" value="female" />
              </el-select>
            </div>
            <div v-else class="user-info">
              <span class="username">{{ userInfo.username }}</span>
              <div class="gender-badge" :class="userInfo.gender">
                <el-icon>
                  <svg v-if="userInfo.gender === 'male'" viewBox="0 0 24 24">
                    <path d="M9,9C10.29,9 11.5,9.41 12.47,10.11L17.58,5H13V3H21V11H19V6.41L13.89,11.5C14.59,12.5 15,13.7 15,15A6,6 0 0,1 9,21A6,6 0 0,1 3,15A6,6 0 0,1 9,9M9,11A4,4 0 0,0 5,15A4,4 0 0,0 9,19A4,4 0 0,0 13,15A4,4 0 0,0 9,11Z" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24">
                    <path d="M12,4A6,6 0 0,1 18,10C18,12.97 15.84,15.44 13,15.92V18H15V20H13V22H11V20H9V18H11V15.92C8.16,15.44 6,12.97 6,10A6,6 0 0,1 12,4M12,6A4,4 0 0,0 8,10A4,4 0 0,0 12,14A4,4 0 0,0 16,10A4,4 0 0,0 12,6Z" />
                  </svg>
                </el-icon>
              </div>
            </div>
          </div>
          <div class="info-section">
            <div class="info-item">
              <div class="phone-icon">
                <svg viewBox="0 0 24 24" class="icon">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </div>
              <span class="info-value">{{ userInfo.phone }}</span>
            </div>
          </div>
          <div class="action-section" v-if="isEditing">
            <el-button type="primary" @click="handleSave">保存</el-button>
            <el-button @click="handleCancel">取消</el-button>
          </div>
          <div class="logout-section">
            <el-button type="danger" @click="handleLogout">退出登录</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useFriendStore } from '@/stores/friend'
import { useGroupStore } from '@/stores/group'
import wsClient from '@/utils/websocket'
import defaultAvatar from '@/assets/default-avatar.svg'
import { getUserInfo } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { Plus } from '@element-plus/icons-vue'
import { uploadFile } from '@/api/upload'
import { updateUserInfo } from '@/api/user'
import { ElMessage } from 'element-plus'
import type { UploadProps } from 'element-plus'

interface UserInfo {
  username: string
  phone: string
  gender: string
  avatar: string
}

const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()
const friendStore = useFriendStore()
const groupStore = useGroupStore()
const userStore = useUserStore()

const currentPage = ref('profile')
const isEditing = ref(false)
const userInfo = ref<UserInfo>({
  username: '',
  phone: '',
  gender: '',
  avatar: ''
})
const editForm = ref<UserInfo>({
  username: '',
  phone: '',
  gender: '',
  avatar: ''
})


const beforeAvatarUpload: UploadProps['beforeUpload'] = async (file) => {
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('Avatar size cannot exceed 2MB!')
    return false
  }

  try {
    const response = await uploadFile(file)
    if (response.url) {
      editForm.value.avatar = response.url
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error('头像上传失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message)
    console.error(error)
  }
  return true
}

const handleSave = async () => {
  try {
    await updateUserInfo(editForm.value)
    Object.assign(userInfo.value, editForm.value)
    isEditing.value = false
    ElMessage.success('保存成功')
    await userStore.fetchUserInfo()
  } catch (error: any) {
    ElMessage.error(error.message)
    console.error(error)
  }
}

const handleCancel = () => {
  editForm.value = { ...userInfo.value }
  isEditing.value = false
}

const handleLogout = () => {
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

  // 断开websocket连接
  wsClient.disconnect()

  // 清除本地存储
  localStorage.clear()

  // 跳转到登录页
  router.push('/login')
}

onMounted(async ()  => {
  await userStore.fetchUserInfo()
  userInfo.value = userStore.info as UserInfo
  editForm.value = { ...userInfo.value }
})
</script>

<style scoped>
.profile-container {
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

.profile-content {
  display: flex;
  height: 80vh;
  width: 80vw;
  max-width: 1200px;
  background: var(--color-white);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
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

.profile-info {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.profile-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
}

.profile-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 32px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 24px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.username-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 32px;
}

.edit-fields {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 240px;
}

.edit-fields .el-input,
.edit-fields .el-select {
  width: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

.username {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
}

.gender-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  padding: 4px;
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

.info-section {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.phone-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.phone-icon .icon {
  width: 20px;
  height: 20px;
  fill: var(--color-text-secondary);
}

.info-item .el-input {
  width: 200px;
}

.info-value {
  font-size: 16px;
  color: var(--color-text);
}

.action-section {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  margin-bottom: 24px;
}

.logout-section {
  margin-top: auto;
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.avatar-uploader {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-uploader:hover .upload-overlay {
  opacity: 1;
}

.upload-icon {
  font-size: 24px;
  color: #fff;
}
</style>
