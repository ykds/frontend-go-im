<template>
  <el-dialog
    v-model="visible"
    title="群组申请"
    width="500px"
    :close-on-click-modal="false"
  >
    <div v-if="groupStore.applies.length === 0" class="empty-text">
      暂无申请
    </div>
    <div v-else class="apply-list">
      <div v-for="group in groupStore.applies" class="group-apply">
        <div class="group-header">
          <img :src="group.avatar? 'http://localhost:8080' + group.avatar : defaultAvatar" :alt="group.name" class="group-avatar" />
          <span class="group-name">{{ group.name }}</span>
        </div>
        <div class="user-list">
          <div v-for="user in group.apply" class="user-item">
            <img :src="user.avatar? 'http://localhost:8080' + user.avatar : defaultAvatar" :alt="user.name" class="group-avatar" />
            <span class="user-name">{{ user.name }}</span>
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                :loading="loading[user.apply_id]"
                @click="handleApprove(user.apply_id)"
              >
                同意
              </el-button>
              <el-button
                type="danger"
                size="small"
                :loading="loading[user.apply_id]"
                @click="handleReject(user.apply_id)"
              >
                拒绝
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { approveGroupApply, rejectGroupApply } from '@/api/group'
import { useGroupStore } from '@/stores/group'
import defaultAvatar from '@/assets/default-avatar.svg'

const visible = ref(false)
const loading = ref<Record<string, boolean>>({})
const groupStore = useGroupStore()

const handleApprove = async (applyId: number) => {
  loading.value[applyId] = true
  try {
    await approveGroupApply(applyId)
    ElMessage.success('已同意申请')
    groupStore.applies.forEach(apply => {
      apply.apply = apply.apply.filter(user => user.apply_id !== applyId)
    })
    await groupStore.fetchGroups()
  } catch (error: any) {
    ElMessage.error('操作失败' + error.message)
  } finally {
    loading.value[applyId] = false
  }
}

const handleReject = async (applyId: number) => {
  loading.value[applyId] = true
  try {
    await rejectGroupApply(applyId)
    ElMessage.success('已拒绝申请')
    groupStore.applies.forEach(apply => {
      apply.apply = apply.apply.filter(user => user.apply_id !== applyId)
    })
  } catch (error: any) {
    ElMessage.error('操作失败' + error.message)
  } finally {
    loading.value[applyId] = false
  }
}

defineExpose({
  visible
})
</script>

<style scoped>
.empty-text {
  text-align: center;
  color: #909399;
  padding: 20px 0;
}

.group-apply {
  margin-bottom: 20px;
}

.group-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.group-name {
  margin-left: 12px;
  font-weight: 500;
}

.user-list {
  padding-left: 52px;
}

.user-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.user-name {
  margin-left: 12px;
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.group-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  border: 2px solid var(--color-border);
}
</style>
