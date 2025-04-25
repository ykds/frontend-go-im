<template>
  <el-dialog
    v-model="dialogVisible"
    title="好友申请"
    width="30%"
    :close-on-click-modal="false"
  >
    <div v-if="friendStore.applyList.length > 0" class="apply-list">
      <div v-for="apply in friendStore.applyList" :key="apply.applyId" class="apply-item">
        <img :src="apply.avatar ? API_BASE_URL+apply.avatar : defaultAvatar" class="user-avatar" />
        <span class="user-name">{{ apply.username }}</span>
        <div class="action-buttons">
          <el-button
            type="primary"
            size="small"
            @click="handleApprove(apply.applyId)"
            :loading="processingId === apply.applyId && processingType === 'approve'"
          >
            同意
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleReject(apply.applyId)"
            :loading="processingId === apply.applyId && processingType === 'reject'"
          >
            拒绝
          </el-button>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      暂无好友申请
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import defaultAvatar from '@/assets/default-avatar.svg'
import { ElMessage } from 'element-plus'
import { approveFriendApply, rejectFriendApply } from '@/api/user'
import { useFriendStore } from '@/stores/friend'
import { API_BASE_URL } from '@/config'
export interface ApplyInfo {
  applyId: number
  userId: number
  username: string
  avatar: string
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const processingId = ref<number | null>(null)
const processingType = ref<'approve' | 'reject' | null>(null)

const friendStore = useFriendStore()


const handleApprove = async (applyId: number) => {
  try {
    processingId.value = applyId
    processingType.value = 'approve'
    await approveFriendApply({ applyId: applyId, status: 2 })
    ElMessage.success('已同意好友申请')

    friendStore.applyList.filter(apply => {
      apply.applyId !== applyId
    })

    await friendStore.fetchFriends()
  } catch (error: any) {
    ElMessage.error('同意好友申请失败:'+error.message)
  } finally {
    processingId.value = null
    processingType.value = null
  }
}

const handleReject = async (applyId: number) => {
  try {
    processingId.value = applyId
    processingType.value = 'reject'
    await rejectFriendApply({ applyId: applyId, status: 3 })
    ElMessage.success('已拒绝好友申请')
    friendStore.applyList.filter(apply => {
      apply.applyId !== applyId
    })
  } catch (error: any) {
    ElMessage.error('拒绝好友申请失败:'+error.message)
  } finally {
    processingId.value = null
    processingType.value = null
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    friendStore.fetchApply()
  }
})
</script>

<style scoped>
.apply-list {
  max-height: 400px;
  overflow-y: auto;
}

.apply-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
}

.apply-item:last-child {
  border-bottom: none;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.user-name {
  flex: 1;
  font-size: 14px;
  color: var(--color-text);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.empty-state {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 20px;
}
</style>
