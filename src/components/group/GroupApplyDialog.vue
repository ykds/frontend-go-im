<template>
  <el-dialog
    v-model="visible"
    title="群组申请"
    width="500px"
    :close-on-click-modal="false"
  >
    <div v-if="!groupStore.applies || groupStore.applies.length === 0" class="empty-text">
      暂无申请
    </div>
    <div v-else class="apply-list">
      <div v-for="group in groupStore.applies" class="group-apply">
        <div class="group-header">
          <img :src="group.avatar? API_BASE_URL + group.avatar : defaultAvatar" :alt="group.name" class="group-avatar" />
          <span class="group-name">{{ group.name }}</span>
        </div>
        <div class="user-list">
          <div v-for="user in group.apply" class="user-item">
            <img :src="user.avatar? API_BASE_URL + user.avatar : defaultAvatar" :alt="user.name" class="group-avatar" />
            <div class="user-info">
              <div class="username-section">
                <span class="user-name">{{ user.name }}</span>
                <div class="gender-badge" :class="user.gender">
                  <el-icon>
                    <svg v-if="user.gender === 'male'" viewBox="0 0 24 24">
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
import { API_BASE_URL } from '@/config'
const visible = ref(false)
const loading = ref<Record<string, boolean>>({})
const groupStore = useGroupStore()

const handleApprove = async (applyId: number) => {
  loading.value[applyId] = true
  try {
    await approveGroupApply(applyId)
    ElMessage.success('已同意申请')
    await groupStore.fetchapply()
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
    await groupStore.fetchapply()
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
  margin-left: 12px;
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

.group-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  border: 2px solid var(--color-border);
}
</style>
