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
        <div class="user-info">
          <div class="username-section">
            <span class="user-name">{{ apply.username }}</span>
            <div class="gender-badge" :class="apply.gender">
              <el-icon>
                <svg v-if="apply.gender === 'male'" viewBox="0 0 24 24">
                  <path d="M9,9C10.29,9 11.5,9.41 12.47,10.11L17.58,5H13V3H21V11H19V6.41L13.89,11.5C14.59,12.5 15,13.7 15,15A6,6 0 0,1 9,21A6,6 0 0,1 3,15A6,6 0 0,1 9,9M9,11A4,4 0 0,0 5,15A4,4 0 0,0 9,19A4,4 0 0,0 13,15A4,4 0 0,0 9,11Z" />
                </svg>
                <svg v-else viewBox="0 0 24 24">
                  <path d="M12,4A6,6 0 0,1 18,10C18,12.97 15.84,15.44 13,15.92V18H15V20H13V22H11V20H9V18H11V15.92C8.16,15.44 6,12.97 6,10A6,6 0 0,1 12,4M12,6A4,4 0 0,0 8,10A4,4 0 0,0 12,14A4,4 0 0,0 16,10A4,4 0 0,0 12,6Z" />
                </svg>
              </el-icon>
            </div>
          </div>
        </div>
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
  gender: string
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

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.username-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 14px;
  color: var(--color-text);
  font-weight: 500;
}

.gender-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  padding: 2px;
  background-color: var(--color-background);
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
  width: 16px;
  height: 16px;
  fill: currentColor;
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
