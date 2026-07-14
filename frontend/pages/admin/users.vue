<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const users = ref([])
const loading = ref(true)
const searchQuery = ref('')
const toggling = ref({})

const totalCount = ref(0)

const stats = computed(() => {
  const total = totalCount.value || users.value.length
  const admin = users.value.filter((u) => u.role === 'admin').length
  const locked = users.value.filter((u) => !u.isActive).length
  return { total, admin, locked }
})

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return users.value
  const kw = searchQuery.value.toLowerCase()
  return users.value.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(kw) ||
      u.email?.toLowerCase().includes(kw) ||
      u.phone?.toLowerCase().includes(kw)
  )
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function fetchUsers() {
  loading.value = true
  try {
    const api = useApi()
    const res = await api('/admin/users', { params: { limit: 100 } })
    const data = res.data || {}
    users.value = data.users || data.data || data || []
    totalCount.value = data.total || users.value.length
  } catch {
    users.value = []
  } finally {
    loading.value = false
  }
}

async function toggleLock(user) {
  toggling.value[user.id] = true
  try {
    const api = useApi()
    const res = await api(`/admin/users/${user.id}/toggle-status`, {
      method: 'PATCH',
    })
    user.isActive = res.data?.isActive
  } catch (e) {
    const toast = useToast()
    toast.error(e?.data?.message || 'Thao tác thất bại')
  } finally {
    toggling.value[user.id] = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div>
    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <p class="text-xs text-gray-500 uppercase">Tổng người dùng</p>
        <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <p class="text-xs text-gray-500 uppercase">Quản trị viên</p>
        <p class="text-2xl font-bold text-blue-600">{{ stats.admin }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <p class="text-xs text-gray-500 uppercase">Đã khóa</p>
        <p class="text-2xl font-bold text-red-600">{{ stats.locked }}</p>
      </div>
    </div>

    <!-- Search -->
    <div class="flex items-center gap-4 mb-6">
      <div class="relative flex-1 max-w-xs">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm người dùng..."
          class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p class="text-sm text-gray-500">Tìm thấy {{ filteredUsers.length }} người dùng</p>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="text-center py-12 text-sm text-gray-400">
        Không tìm thấy người dùng nào
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left py-3 px-4 text-gray-500 font-medium">Người dùng</th>
              <th class="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
              <th class="text-left py-3 px-4 text-gray-500 font-medium">Vai trò</th>
              <th class="text-left py-3 px-4 text-gray-500 font-medium">SĐT</th>
              <th class="text-center py-3 px-4 text-gray-500 font-medium">Đơn hàng</th>
              <th class="text-center py-3 px-4 text-gray-500 font-medium">Trạng thái</th>
              <th class="text-left py-3 px-4 text-gray-500 font-medium">Ngày tạo</th>
              <th class="text-center py-3 px-4 text-gray-500 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
                    {{ (user.fullName || '?')[0] }}
                  </div>
                  <span class="text-gray-900 font-medium truncate max-w-[150px]">{{ user.fullName }}</span>
                </div>
              </td>
              <td class="py-3 px-4 text-gray-600">{{ user.email }}</td>
              <td class="py-3 px-4">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'"
                >
                  {{ user.role === 'admin' ? 'Admin' : 'Người dùng' }}
                </span>
              </td>
              <td class="py-3 px-4 text-gray-600">{{ user.phone || '---' }}</td>
              <td class="py-3 px-4 text-center text-gray-700">{{ user._count?.orders || 0 }}</td>
              <td class="py-3 px-4 text-center">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="user.isActive === false ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
                >
                  {{ user.isActive === false ? 'Đã khóa' : 'Hoạt động' }}
                </span>
              </td>
              <td class="py-3 px-4 text-gray-500 text-xs">{{ formatDate(user.createdAt || user.created_at) }}</td>
              <td class="py-3 px-4 text-center">
                <button
                  @click="toggleLock(user)"
                  :disabled="toggling[user.id] || user.role === 'admin'"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    :class="[
                    user.role === 'admin'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : user.isActive === false
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                  ]"
                >
                  {{ user.isActive === false ? 'Mở khóa' : 'Khóa' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
