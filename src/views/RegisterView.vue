<template>
  <div class="register-container">
    <div class="register-box">
      <!-- <div class="logo-container">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
      </div> -->
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="avatar-upload">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="avatarUrl" :src="API_BASE_URL+avatarUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">点击上传头像</div>
        </div>


        <div class="input-group gender-select">
          <el-radio-group v-model="form.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
          </el-radio-group>
        </div>


        <div class="input-group">
          <input
            type="text"
            v-model="form.phone"
            placeholder="请输入手机号"
            class="input-field"
            :disabled="loading"
            required
          />
        </div>

        <div class="input-group">
          <input
            type="text"
            v-model="form.username"
            placeholder="请输入用户名"
            class="input-field"
            :disabled="loading"
            required
          />
        </div>

        <div class="input-group">
          <input
            type="password"
            v-model="form.password"
            placeholder="请输入密码"
            class="input-field"
            :disabled="loading"
            required
          />
        </div>

        <div class="input-group">
          <input
            type="password"
            v-model="form.confirmPassword"
            placeholder="请确认密码"
            class="input-field"
            :disabled="loading"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="register-button" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>

        <div class="login-link">
          已有账号？<a @click="router.push('/login')">立即登录</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { register } from '@/api/auth'
import type { UploadProps } from 'element-plus'
import { ElMessage } from 'element-plus'
import { uploadFile } from '@/api/upload'
import { API_BASE_URL } from '@/config'
const router = useRouter()
const loading = ref(false)
const error = ref<string | null>(null)
const avatarUrl = ref('')

interface RegisterForm {
  phone: string
  username: string
  gender: 'male' | 'female'
  password: string
  confirmPassword: string
  avatar?: File
}

const form = ref<RegisterForm>({
  phone: '',
  username: '',
  gender: 'male',
  password: '',
  confirmPassword: '',
})

const beforeAvatarUpload: UploadProps['beforeUpload'] = async (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('上传头像图片只能是图片格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
    return false
  }

  try {
    loading.value = true
    const response = await uploadFile(file)
    if (response.url) {
      avatarUrl.value = response.url
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error('头像上传失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message)
    console.error(error)
  } finally {
    loading.value = false
  }
  return false
}

const validateForm = () => {
  if (!form.value.phone) {
    error.value = '请输入手机号'
    return false
  }
  if (!form.value.username) {
    error.value = '请输入用户名'
    return false
  }
  if (!form.value.password) {
    error.value = '请输入密码'
    return false
  }
  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return false
  }
  return true
}

const handleRegister = async () => {
  if (!validateForm()) return

  try {
    loading.value = true
    error.value = null

    await register({
      phone: form.value.phone,
      username: form.value.username,
      password: form.value.password,
      confirm_password: form.value.confirmPassword,
      avatar: avatarUrl.value,
      gender: form.value.gender,
    })
    router.push('/login')
  } catch (err: any) {
    error.value = err.message || '注册失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
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

.register-box {
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

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-uploader {
  border: 1px dashed var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader:hover {
  border-color: var(--color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.upload-tip {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
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

.input-field:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
}

.gender-select {
  display: flex;
  justify-content: center;
  margin: 0;
}

.gender-select :deep(.el-radio) {
  margin-right: 32px;
}

.gender-select :deep(.el-radio:last-child) {
  margin-right: 0;
}

.gender-select :deep(.el-radio__label) {
  font-size: 16px;
  color: var(--color-text);
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  text-align: center;
  margin-top: 0.5rem;
}

.register-button {
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

.register-button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.register-button:active {
  transform: translateY(0);
}

.register-button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

.register-button:disabled:hover {
  transform: none;
  box-shadow: none;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.login-link a {
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-box {
    padding: 2rem;
  }

  .input-field {
    padding: 12px 16px;
  }

  .register-button {
    padding: 12px 20px;
  }

  .gender-select :deep(.el-radio) {
    margin-right: 20px;
  }
}
</style>
