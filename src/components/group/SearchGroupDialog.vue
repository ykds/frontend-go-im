<template>
  <el-dialog
    v-model="dialogVisible"
    title="搜索群组"
    width="500px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="search-container">
      <div class="search-input-wrapper">
        <el-input
          v-model="groupNo"
          placeholder="请输入群号"
          @keyup.enter="handleSearch"
          maxlength="11"
          oninput="value=value.replace(/[^\d]/g,'')"
        >
          <template #append>
            <el-button @click="handleSearch" :loading="loading">
              搜索
            </el-button>
          </template>
        </el-input>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searchResult" class="search-result">
        <div class="group-item" v-for="group in searchResult" :key="group.id">
          <img :src="group.avatar || defaultAvatar" alt="群头像" class="group-avatar" />
          <div class="group-info">
            <div class="group-name">{{ group.name }}</div>
            <div class="group-details">
              <span class="group-id">群号：{{ group.groupNo }}</span>
              <span class="group-count">成员：{{ group.memberCount }}人</span>
            </div>
          </div>
          <el-button
            type="primary"
            size="small"
            @click="handleApply(group.groupNo)"
            :loading="applyLoading"
          >
            申请加入
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, onMounted } from 'vue'
import { ElMessage, ElDialog, ElInput, ElButton } from 'element-plus'
import defaultAvatar from '@/assets/default-avatar.svg'
import { searchGroup, applyJoinGroup } from '@/api/group'

interface GroupInfo {
  id: number
  name: string
  avatar: string
  memberCount: number
  groupNo: number
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const dialogVisible = ref(false)
const groupNo = ref('')
const loading = ref(false)
const applyLoading = ref(false)
const searchResult = ref<GroupInfo[] | null>(null)

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    // 关闭时重置状态
    groupNo.value = ''
    searchResult.value = null
  }
})

const handleSearch = async () => {
  if (!groupNo.value) {
    ElMessage.warning('请输入群号')
    return
  }

  try {
    loading.value = true
    const response = await searchGroup({ groupNo: parseInt(groupNo.value) })
    searchResult.value = response.data.infos
    searchResult.value.forEach(group => {
      group.avatar = "http://localhost:8080" + group.avatar
    })
  } catch (error: any) {
    searchResult.value = null
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

const handleApply = async (groupNo: number) => {
  if (!searchResult.value) return

  try {
    applyLoading.value = true
    await applyJoinGroup(groupNo)
    ElMessage.success('申请已发送')
    dialogVisible.value = false
  } catch (error: any) {
    ElMessage.error(error.message)
  } finally {
    applyLoading.value = false
  }
}
</script>

<style scoped>
.search-container {
  padding: 0 20px;
}

.search-input-wrapper {
  margin-bottom: 20px;
}

.search-result {
  max-height: 400px;
  overflow-y: auto;
}

.group-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 10px;
}

.group-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
}

.group-info {
  flex: 1;
  margin-right: 15px;
}

.group-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5px;
}

.group-details {
  font-size: 13px;
  color: #666;
}

.group-id {
  margin-right: 15px;
}

:deep(.el-dialog) {
  margin-top: 15vh !important;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}

:deep(.el-dialog__header) {
  margin-right: 0;
  padding: 20px;
  border-bottom: 1px solid var(--color-border);
}

:deep(.el-dialog__headerbtn) {
  top: 20px;
}
</style>
