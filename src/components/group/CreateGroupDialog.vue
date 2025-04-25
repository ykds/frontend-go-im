<template>
  <el-dialog
    v-model="dialogVisible"
    title="创建群组"
    width="500px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="create-container">
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
        <div class="upload-tip">点击上传群头像</div>
      </div>

      <div class="form-item">
        <el-input
          v-model="groupName"
          placeholder="请输入群组名称"
          maxlength="20"
          show-word-limit
        />
      </div>

      <div class="form-actions">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate" :loading="loading">
          创建
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'
import { createGroup } from '@/api/group'
import { uploadFile } from '@/api/upload'
import { useGroupStore } from '@/stores/group'
import { useChatStore } from '@/stores/chat'
import { API_BASE_URL } from '@/config'
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const dialogVisible = ref(false)
const avatarUrl = ref('')
const groupName = ref('')
const loading = ref(false)
const groupStore = useGroupStore()
const chatStore = useChatStore()

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    // 关闭时重置状态
    avatarUrl.value = ''
    groupName.value = ''
  }
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

const handleCreate = async () => {
  if (!groupName.value) {
    ElMessage.warning('请输入群组名称')
    return
  }

  try {
    loading.value = true
    await createGroup({
      name: groupName.value,
      avatar: avatarUrl.value || '' // 如果没有上传头像，传空字符串
    })
    ElMessage.success('创建成功')
    dialogVisible.value = false
    await groupStore.fetchGroups()
    await chatStore.fetchSessions()
  } catch (error: any) {
    ElMessage.error(error.message)
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-container {
  padding: 0 20px;
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

.form-item {
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>
