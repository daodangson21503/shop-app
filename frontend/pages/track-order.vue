<script setup>
import { ref, computed } from 'vue'

definePageMeta({ layout: 'default' })

const orderId = ref('')
const phone = ref('')
const order = ref(null)
const loading = ref(false)
const searched = ref(false)
const errorMsg = ref('')

const statusLabels = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipping: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const timelineSteps = computed(() => {
  if (!order.value) return []
  const steps = [
    { key: 'pending', label: 'Đơn hàng đã đặt', date: order.value.createdAt, done: true },
    { key: 'confirmed', label: 'Xác nhận đơn hàng', date: order.value.confirmedAt, done: !!order.value.confirmedAt },
    { key: 'shipping', label: 'Đang giao hàng', date: order.value.shippingAt, done: !!order.value.shippingAt },
    { key: 'completed', label: 'Giao hàng thành công', date: order.value.completedAt, done: !!order.value.completedAt },
  ]
  if (order.value.status === 'cancelled') {
    steps.push({ key: 'cancelled', label: 'Đã hủy', date: order.value.cancelledAt, done: true, cancelled: true })
  }
  return steps
})

function formatPrice(val) {
  if (!val && val !== 0) return ''
  return new Intl.NumberFormat('vi-VN').format(val) + 'đ'
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

async function trackOrder() {
  if (!orderId.value.trim() || !phone.value.trim()) {
    errorMsg.value = 'Vui lòng nhập mã đơn hàng và số điện thoại'
    return
  }
  loading.value = true
  searched.value = true
  order.value = null
  errorMsg.value = ''
  try {
    const api = useApi()
    const res = await api(`/orders/track/${orderId.value.trim()}`, {
      params: { phone: phone.value.trim() },
    })
    order.value = res.data
  } catch {
    order.value = null
    errorMsg.value = 'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn và số điện thoại.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <nav class="breadcrumb">
      <NuxtLink to="/">Trang chủ</NuxtLink>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-gray-900 font-medium">Tra cứu đơn hàng</span>
    </nav>

    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900 mb-2">Tra cứu đơn hàng</h1>
        <p class="text-gray-500">Nhập mã đơn hàng và số điện thoại để kiểm tra tình trạng đơn hàng</p>
      </div>

      <!-- Search Form -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="sm:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Mã đơn hàng</label>
            <input
              v-model="orderId"
              type="text"
              placeholder="Ví dụ: abc-123-xyz"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              @keyup.enter="trackOrder"
            />
          </div>
          <div class="sm:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
            <input
              v-model="phone"
              type="tel"
              placeholder="Số điện thoại đặt hàng"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              @keyup.enter="trackOrder"
            />
          </div>
          <div class="sm:col-span-1 flex items-end">
            <button
              @click="trackOrder"
              :disabled="loading"
              class="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {{ loading ? 'Đang tra cứu...' : 'Tra cứu' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="errorMsg && !loading" class="bg-red-50 border border-red-200 rounded-xl p-5 text-center mb-8">
        <svg class="w-12 h-12 mx-auto text-red-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-red-700 font-medium">{{ errorMsg }}</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-16">
        <div class="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-sm text-gray-500">Đang tra cứu thông tin đơn hàng...</p>
      </div>

      <!-- Order Result -->
      <div v-if="order && !loading" class="space-y-6">
        <!-- Order Header -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p class="text-sm text-gray-500">
                Mã đơn hàng: <span class="font-mono font-semibold text-gray-900">#{{ order.id }}</span>
              </p>
              <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(order.createdAt) }}</p>
            </div>
            <span
              class="px-3 py-1.5 rounded-full text-xs font-semibold self-start"
              :class="statusColors[order.status] || 'bg-gray-100 text-gray-600'"
            >
              {{ statusLabels[order.status] || order.status }}
            </span>
          </div>

          <!-- Timeline -->
          <div class="px-6 py-5">
            <div class="relative">
              <div v-for="(step, idx) in timelineSteps" :key="step.key"
                class="flex items-start gap-4 pb-6 last:pb-0 relative"
              >
                <!-- Connector line -->
                <div
                  v-if="idx < timelineSteps.length - 1"
                  class="absolute left-[11px] top-6 bottom-0 w-0.5"
                  :class="step.done && !step.cancelled ? 'bg-green-400' : 'bg-gray-200'"
                ></div>
                <!-- Dot -->
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 relative z-10"
                  :class="step.cancelled
                    ? 'bg-red-100'
                    : step.done
                      ? 'bg-green-100'
                      : 'bg-gray-100'"
                >
                  <svg v-if="step.cancelled" class="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <svg v-else-if="step.done" class="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                  <div v-else class="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
                <!-- Content -->
                <div>
                  <p class="text-sm font-medium" :class="step.cancelled ? 'text-red-600' : step.done ? 'text-gray-900' : 'text-gray-400'">
                    {{ step.label }}
                  </p>
                  <p v-if="step.date" class="text-xs text-gray-400 mt-0.5">{{ formatDate(step.date) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h3 class="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Thông tin nhận hàng
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-gray-500">Người nhận:</span>
              <span class="text-gray-900 font-medium ml-2">{{ order.customerName }}</span>
            </div>
            <div>
              <span class="text-gray-500">Số điện thoại:</span>
              <span class="text-gray-900 font-medium ml-2">{{ order.customerPhone }}</span>
            </div>
            <div class="sm:col-span-2">
              <span class="text-gray-500">Địa chỉ:</span>
              <span class="text-gray-900 font-medium ml-2">{{ order.customerAddress }}</span>
            </div>
            <div v-if="order.paymentMethod">
              <span class="text-gray-500">Phương thức thanh toán:</span>
              <span class="text-gray-900 font-medium ml-2">{{ order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : order.paymentMethod }}</span>
            </div>
            <div>
              <span class="text-gray-500">Thanh toán:</span>
              <span
                class="ml-2 font-medium"
                :class="order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'"
              >
                {{ order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Sản phẩm đã đặt ({{ order.items?.length || 0 }})
            </h3>
          </div>
          <div class="divide-y divide-gray-50">
            <div
              v-for="item in (order.items || [])"
              :key="item.id"
              class="px-6 py-4 flex items-center gap-4"
            >
              <img
                :src="item.imageUrl || '/placeholder-product.png'"
                :alt="item.productName"
                class="w-16 h-16 rounded-lg object-contain bg-[#f5f5f5] p-1 flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ item.productName }}</p>
                <p class="text-xs text-gray-400 mt-0.5">SL: {{ item.quantity }}</p>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="text-sm font-medium text-gray-900">{{ formatPrice(item.unitPrice) }}</p>
                <p class="text-xs text-gray-400">{{ formatPrice(item.subtotal) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="space-y-2.5 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Tạm tính</span>
              <span class="text-gray-900">{{ formatPrice(order.subtotalAmount) }}</span>
            </div>
            <div v-if="order.discountAmount > 0" class="flex justify-between">
              <span class="text-gray-500">Giảm giá</span>
              <span class="text-green-600">-{{ formatPrice(order.discountAmount) }}</span>
            </div>
            <div class="flex justify-between border-t border-gray-100 pt-2.5">
              <span class="text-gray-500">Phí vận chuyển</span>
              <span class="text-gray-900">{{ order.shippingFee > 0 ? formatPrice(order.shippingFee) : 'Miễn phí' }}</span>
            </div>
            <div class="flex justify-between border-t border-gray-100 pt-2.5">
              <span class="text-base font-bold text-gray-900">Tổng cộng</span>
              <span class="text-lg font-bold text-red-600">{{ formatPrice(order.totalAmount) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- No search yet -->
      <div v-if="!searched" class="text-center py-16">
        <svg class="w-20 h-20 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="text-lg font-medium text-gray-500 mb-1">Nhập thông tin để tra cứu</h3>
        <p class="text-sm text-gray-400">Nhập mã đơn hàng và số điện thoại để kiểm tra tình trạng đơn hàng của bạn</p>
      </div>
    </div>
  </div>
</template>
