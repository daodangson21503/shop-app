<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default', alias: ['/account/orders'] })

const authStore = useAuthStore()
const router = useRouter()

const orders = ref([])
const loading = ref(true)
const activeTab = ref('all')

const statusTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
]

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipping: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabels = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value
  return orders.value.filter((o) => o.status === activeTab.value)
})

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function getStatusCount(status) {
  if (status === 'all') return orders.value.length
  return orders.value.filter((o) => o.status === status).length
}

async function fetchOrders() {
  loading.value = true
  try {
    const api = useApi()
    const res = await api('/orders/my-orders')
    orders.value = res.data?.orders || res.data?.data || res.data || []
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
}

async function cancelOrder(orderId) {
  if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
  try {
    const api = useApi()
    await api(`/orders/${orderId}/cancel`, { method: 'PATCH' })
    await fetchOrders()
  } catch {}
}

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  fetchOrders()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <NuxtLink to="/" class="hover:text-blue-600">Trang chủ</NuxtLink>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-gray-900 font-medium">Đơn hàng của tôi</span>
    </nav>

    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Đơn hàng của tôi</h1>

    <!-- Status Tabs -->
    <div class="flex flex-wrap gap-2 mb-8">
      <button
        v-for="tab in statusTabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
        :class="[
          activeTab === tab.key
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
      >
        {{ tab.label }}
        <span
          class="ml-1.5 text-xs"
          :class="activeTab === tab.key ? 'text-blue-200' : 'text-gray-400'"
        >
          ({{ getStatusCount(tab.key) }})
        </span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-sm text-gray-500">Đang tải đơn hàng...</p>
    </div>

    <!-- Orders -->
    <div v-else-if="filteredOrders.length > 0" class="space-y-4">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="bg-white rounded-xl border border-gray-100 overflow-hidden"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p class="text-sm text-gray-500">
              Mã đơn: <span class="font-mono font-medium text-gray-900">#{{ order.id }}</span>
            </p>
            <p class="text-xs text-gray-400">{{ formatDate(order.createdAt || order.created_at) }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span
              class="px-3 py-1 rounded-full text-xs font-medium"
              :class="statusColors[order.status] || 'bg-gray-100 text-gray-600'"
            >
              {{ statusLabels[order.status] || order.status }}
            </span>
            <button
              v-if="order.status === 'pending'"
              @click="cancelOrder(order.id)"
              class="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Hủy đơn
            </button>
          </div>
        </div>

        <!-- Items -->
        <div class="px-6 py-4 space-y-3">
          <div
            v-for="item in (order.items || order.orderItems || [])"
            :key="item.id || item.productId"
            class="flex items-center gap-3"
          >
            <img
              :src="item.imageUrl || item.thumbnail || '/placeholder-product.png'"
              :alt="item.name || item.productName"
              class="w-14 h-14 rounded-lg object-contain bg-[#f5f5f5] p-1 flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900 truncate">{{ item.name || item.productName }}</p>
              <p class="text-xs text-gray-400">SL: {{ item.quantity }}</p>
            </div>
            <span class="text-sm font-medium text-gray-900">{{ formatPrice((item.price || 0) * (item.quantity || 0)) }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 flex items-center justify-between">
          <p class="text-sm text-gray-500">
            {{ (order.items || order.orderItems || []).length }} sản phẩm
          </p>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">Tổng:</span>
            <span class="text-lg font-bold text-red-600">{{ formatPrice(order.total || order.totalAmount || 0) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="flex flex-col items-center justify-center py-20 text-center">
      <svg class="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 class="text-lg font-medium text-gray-600 mb-1">Chưa có đơn hàng</h3>
      <p class="text-sm text-gray-400 mb-4">Bạn chưa đặt đơn hàng nào</p>
      <NuxtLink
        to="/products"
        class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        Mua sắm ngay
      </NuxtLink>
    </div>
  </div>
</template>
