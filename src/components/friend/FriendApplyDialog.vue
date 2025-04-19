<template>
  <el-dialog
    v-model="dialogVisible"
    title="好友申请"
    width="30%"
    :close-on-click-modal="false"
  >
    <div v-if="applyList.length > 0" class="apply-list">
      <div v-for="apply in applyList" :key="apply.applyId" class="apply-item">
        <img :src="apply.avatar || defaultAvatar" class="user-avatar" />
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
import { ref, onMounted, computed, watch } from 'vue'
import defaultAvatar from '@/assets/default-avatar.svg'
import { ElMessage } from 'element-plus'
import { listFriendApply, approveFriendApply, rejectFriendApply } from '@/api/user'
import { useFriendStore } from '@/stores/friend'
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

const applyList = ref<ApplyInfo[]>([])
const processingId = ref<number | null>(null)
const processingType = ref<'approve' | 'reject' | null>(null)

const friendStore = useFriendStore()

const fetchApplyList = async () => {
  try {
    const response = await listFriendApply()
    applyList.value = response.list
  } catch (error: any) {
    ElMessage.error('获取好友申请列表失败:'+error.message)
  }
}

const handleApprove = async (applyId: number) => {
  try {
    processingId.value = applyId
    processingType.value = 'approve'
    await approveFriendApply({ applyId: applyId, status: 2 })
    ElMessage.success('已同意好友申请')
    await fetchApplyList()
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
    await fetchApplyList()
  } catch (error: any) {
    ElMessage.error('拒绝好友申请失败:'+error.message)
  } finally {
    processingId.value = null
    processingType.value = null
  }
}

onMounted(() => {
  fetchApplyList()
})

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchApplyList()
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
