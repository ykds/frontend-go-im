<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加好友"
    width="30%"
    :close-on-click-modal="false"
  >
    <div class="search-container">
      <el-input
        v-model="searchQuery"
        placeholder="请输入用户名或手机号"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <div v-if="searchResults.length > 0" class="results-container">
      <div v-for="user in searchResults" :key="user.id" class="result-item">
        <img :src="user.avatar ? API_BASE_URL + user.avatar : defaultAvatar" class="user-avatar" />
        <span class="user-name">{{ user.username }}</span>
        <el-button
          type="primary"
          size="small"
          @click="handleAddFriend(user.id)"
          :loading="addingFriend === user.id"
        >
          添加好友
        </el-button>
      </div>
    </div>
    <div v-else-if="hasSearched" class="empty-results">
      未找到相关用户
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import defaultAvatar from '@/assets/default-avatar.svg'
import { ElMessage } from 'element-plus'
import { searchUser, applyFriend } from '@/api/user'
import { API_BASE_URL } from '@/config'
interface UserInfo {
  id: number
  username: string
  phone: string
  gender: string
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

const searchQuery = ref('')
const searchResults = ref<UserInfo[]>([])
const hasSearched = ref(false)
const addingFriend = ref<number | null>(null)

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return

  try {
    const response = await searchUser({ phone: searchQuery.value })
    searchResults.value = response.list
  } catch (error: any) {
    ElMessage.error('搜索用户失败:'+error.message)
  }
}

const handleAddFriend = async (id: number) => {
  try {
    addingFriend.value = id
    await applyFriend({ friendId: id })
    ElMessage.success('好友申请已发送')
  } catch (error: any) {
    ElMessage.error('发送好友申请失败:'+error.message)
  } finally {
    addingFriend.value = null
  }
}
</script>

<style scoped>
.search-container {
  margin-bottom: 20px;
}

.results-container {
  max-height: 300px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
}

.result-item:last-child {
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

.empty-results {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 20px;
}
</style>
