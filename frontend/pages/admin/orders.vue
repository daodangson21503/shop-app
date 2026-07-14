<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const orders = ref([])
const loading = ref(true)
const activeTab = ref('all')
const showDetailModal = ref(false)
const selectedOrder = ref(null)
const changingStatus = ref({})
const confirmModal = ref({ show: false, order: null, newStatus: '', oldStatus: '' })

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

const nextStatuses = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value
  return orders.value.filter((o) => o.status === activeTab.value)
})

function formatPrice(val) {
  return new Intl.NumberFormat('vi-VN').format(val) + 'đ'
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
    const res = await api('/orders')
    orders.value = res.data?.orders || res.data?.data || res.data || []
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
}

function confirmStatusChange(order, newStatus) {
  confirmModal.value = { show: true, order, newStatus, oldStatus: order.status }
}

function cancelStatusChange() {
  confirmModal.value = { show: false, order: null, newStatus: '', oldStatus: '' }
}

async function executeStatusChange() {
  const { order, newStatus, oldStatus } = confirmModal.value
  if (!order) return
  changingStatus.value[order.id] = true
  try {
    const api = useApi()
    await api(`/orders/${order.id}/status`, {
      method: 'PATCH',
      body: { status: newStatus },
    })
    order.status = newStatus
    confirmModal.value = { show: false, order: null, newStatus: '', oldStatus: '' }
  } catch {
    useToast().error('Cập nhật trạng thái thất bại')
  } finally {
    changingStatus.value[order.id] = false
  }
}

function openDetail(order) {
  selectedOrder.value = order
  showDetailModal.value = true
}

function closeDetail() {
  showDetailModal.value = false
  selectedOrder.value = null
}

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div>
    <!-- Status Tabs -->
    <div class="flex flex-wrap gap-2 mb-6">
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
        <span class="ml-1.5 text-xs" :class="activeTab === tab.key ? 'text-blue-200' : 'text-gray-400'">
          ({{ getStatusCount(tab.key) }})
        </span>
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="filteredOrders.length === 0" class="text-center py-12 text-sm text-gray-400">
        Không có đơn hàng nào
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left py-3 px-4 text-gray-500 font-medium">Mã đơn</th>
              <th class="text-left py-3 px-4 text-gray-500 font-medium">Khách hàng</th>
              <th class="text-left py-3 px-4 text-gray-500 font-medium">SĐT</th>
              <th class="text-right py-3 px-4 text-gray-500 font-medium">Tổng tiền</th>
              <th class="text-center py-3 px-4 text-gray-500 font-medium">Trạng thái</th>
              <th class="text-left py-3 px-4 text-gray-500 font-medium">Ngày</th>
              <th class="text-right py-3 px-4 text-gray-500 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="py-3 px-4 font-mono font-medium text-gray-900">#{{ order.id }}</td>
              <td class="py-3 px-4">
                <div>
                  <p class="text-gray-900 font-medium">{{ order.customerName }}</p>
                </div>
              </td>
              <td class="py-3 px-4 text-gray-600">{{ order.customerPhone }}</td>
              <td class="py-3 px-4 text-right font-medium text-gray-900">{{ formatPrice(order.totalAmount || 0) }}</td>
              <td class="py-3 px-4 text-center">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="statusColors[order.status] || 'bg-gray-100 text-gray-600'"
                >
                  {{ statusLabels[order.status] || order.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-gray-500 text-xs">{{ formatDate(order.createdAt || order.created_at) }}</td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openDetail(order)"
                    class="px-3 py-1.5 text-xs text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Chi tiết
                  </button>
                  <select
                    v-if="nextStatuses[order.status]?.length"
                    :value="order.status"
                    @change="confirmStatusChange(order, $event.target.value)"
                    class="px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none bg-white"
                  >
                    <option :value="order.status" disabled>{{ statusLabels[order.status] }}</option>
                    <option v-for="ns in nextStatuses[order.status]" :key="ns" :value="ns">
                      {{ statusLabels[ns] || ns }}
                    </option>
                  </select>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Confirm Status Change Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="confirmModal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cancelStatusChange"></div>
          <div class="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-2">Xác nhận thay đổi trạng thái</h3>
            <p class="text-sm text-gray-600 mb-4">
              Chuyển đơn hàng #{{ confirmModal.order?.id }} từ
              <strong>{{ statusLabels[confirmModal.oldStatus] }}</strong>
              sang
              <strong>{{ statusLabels[confirmModal.newStatus] }}</strong>?
            </p>
            <div class="flex justify-end gap-3">
              <button @click="cancelStatusChange" class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">Hủy</button>
              <button
                @click="executeStatusChange"
                class="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                :disabled="changingStatus[confirmModal.order?.id]"
              >
                <span v-if="changingStatus[confirmModal.order?.id]" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5 align-middle"></span>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Detail Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showDetailModal && selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeDetail"></div>
          <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 class="text-lg font-bold text-gray-900">Chi tiết đơn hàng #{{ selectedOrder.id }}</h3>
                <p class="text-xs text-gray-500">{{ formatDate(selectedOrder.createdAt || selectedOrder.created_at) }}</p>
              </div>
              <button @click="closeDetail" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="flex-1 overflow-y-auto p-6 space-y-4">
              <!-- Customer Info -->
              <div>
                <h4 class="text-sm font-bold text-gray-900 mb-2">Thông tin khách hàng</h4>
                <div class="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                  <p><span class="text-gray-500">Tên:</span> {{ selectedOrder.customerName }}</p>
                  <p><span class="text-gray-500">SĐT:</span> {{ selectedOrder.customerPhone }}</p>
                  <p><span class="text-gray-500">Địa chỉ:</span> {{ selectedOrder.customerAddress }}</p>
                </div>
              </div>

              <!-- Status -->
              <div>
                <h4 class="text-sm font-bold text-gray-900 mb-2">Trạng thái</h4>
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="statusColors[selectedOrder.status] || 'bg-gray-100 text-gray-600'"
                >
                  {{ statusLabels[selectedOrder.status] || selectedOrder.status }}
                </span>
              </div>

              <!-- Items -->
              <div>
                <h4 class="text-sm font-bold text-gray-900 mb-2">Sản phẩm</h4>
                <div class="space-y-2">
                  <div
                    v-for="item in (selectedOrder.items || selectedOrder.orderItems || [])"
                    :key="item.id || item.productId"
                    class="flex items-center gap-3 bg-gray-50 rounded-lg p-3"
                  >
                    <img
                      :src="item.imageUrl || item.thumbnail || '/placeholder-product.png'"
                      :alt="item.name || item.productName"
                      class="w-10 h-10 rounded-lg object-contain bg-[#f5f5f5] p-1"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-gray-900 truncate">{{ item.productName }}</p>
                      <p class="text-xs text-gray-400">SL: {{ item.quantity }} x {{ formatPrice(item.unitPrice || 0) }}</p>
                    </div>
                    <span class="text-sm font-medium text-gray-900">{{ formatPrice((item.unitPrice || 0) * (item.quantity || 0)) }}</span>
                  </div>
                </div>
              </div>

              <!-- Total -->
              <div class="border-t border-gray-100 pt-4 flex justify-between">
                <span class="text-base font-bold text-gray-900">Tổng cộng</span>
                <span class="text-lg font-bold text-red-600">{{ formatPrice(selectedOrder.totalAmount || 0) }}</span>
              </div>
            </div>
            <div class="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50 rounded-b-2xl">
              <button @click="closeDetail" class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">Đóng</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
