<script setup>
import { ref, watch, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

const props = defineProps({
  orderAmount: {
    type: Number,
    default: 0,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'apply'])

const api = useApi()

const vouchers = ref([])
const loading = ref(false)
const error = ref('')
const selectedVoucher = ref(null)
const fetchError = ref('')

async function fetchVouchers() {
  loading.value = true
  error.value = ''
  fetchError.value = ''
  try {
    const response = await api('/vouchers/available', {
      params: { orderAmount: props.orderAmount },
    })
    if (response.success) {
      vouchers.value = response.data || []
    } else {
      fetchError.value = response.message || 'Không thể tải danh sách voucher'
    }
  } catch (e) {
    fetchError.value = 'Đã có lỗi xảy ra khi tải voucher'
    console.error('Fetch vouchers error:', e)
  } finally {
    loading.value = false
  }
}

function close() {
  emit('update:modelValue', false)
  selectedVoucher.value = null
}

function selectVoucher(voucher) {
  if (selectedVoucher.value?.id === voucher.id) {
    selectedVoucher.value = null
  } else {
    selectedVoucher.value = voucher
  }
}

function confirmSelection() {
  if (!selectedVoucher.value) return

  let discountAmount = 0
  const voucher = selectedVoucher.value

  if (voucher.discountType === 'percent') {
    const percent = Number(voucher.discountValue || 0)
    discountAmount = Math.round((props.orderAmount * percent) / 100)
    const maxDiscount = Number(voucher.maxDiscount || Infinity)
    if (maxDiscount && discountAmount > maxDiscount) {
      discountAmount = maxDiscount
    }
  } else {
    discountAmount = Number(voucher.discountValue || 0)
  }

  emit('apply', { voucher: selectedVoucher.value, discountAmount })
  close()
}

function formatPrice(value) {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getDiscountLabel(voucher) {
  if (voucher.discountType === 'percent') {
    const val = Number(voucher.discountValue || 0)
    const max = voucher.maxDiscount
    if (max) {
      return `Giảm ${val}% (tối đa ${formatPrice(max)})`
    }
    return `Giảm ${val}%`
  }
  return `Giảm ${formatPrice(voucher.discountValue || 0)}`
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      fetchVouchers()
    } else {
      selectedVoucher.value = null
    }
  }
)
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close"></div>

        <!-- Modal -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="modelValue"
            class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 class="text-lg font-bold text-gray-900">Chọn voucher</h3>
                <p class="text-xs text-gray-500 mt-0.5">Đơn hàng từ {{ formatPrice(orderAmount) }}</p>
              </div>
              <button
                @click="close"
                class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-4 space-y-3">
              <!-- Loading -->
              <div v-if="loading" class="flex flex-col items-center justify-center py-12">
                <div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p class="text-sm text-gray-500">Đang tải voucher...</p>
              </div>

              <!-- Error -->
              <div
                v-else-if="fetchError"
                class="flex flex-col items-center justify-center py-12 text-center"
              >
                <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p class="text-sm text-gray-500">{{ fetchError }}</p>
                <button
                  @click="fetchVouchers"
                  class="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Thử lại
                </button>
              </div>

              <!-- Empty -->
              <div
                v-else-if="vouchers.length === 0"
                class="flex flex-col items-center justify-center py-12 text-center"
              >
                <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <p class="text-sm text-gray-500 font-medium">Không có voucher khả dụng</p>
                <p class="text-xs text-gray-400 mt-1">Hãy quay lại sau nhé!</p>
              </div>

              <!-- Voucher List -->
              <template v-else>
                <button
                  v-for="voucher in vouchers"
                  :key="voucher.id"
                  @click="selectVoucher(voucher)"
                  class="w-full text-left p-4 rounded-xl border-2 transition-all duration-200"
                  :class="[
                    selectedVoucher?.id === voucher.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm'
                  ]"
                >
                  <div class="flex items-start gap-3">
                    <!-- Discount Badge -->
                    <div
                      class="w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                      :class="[
                        selectedVoucher?.id === voucher.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      ]"
                    >
                      <span class="text-lg font-bold leading-none">
                        {{ voucher.discountType === 'percent' ? `${voucher.discountValue}%` : '%' }}
                      </span>
                      <span class="text-[9px] uppercase tracking-wide opacity-80">giảm</span>
                    </div>

                    <!-- Voucher Info -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="font-mono text-sm font-bold text-gray-900">
                          {{ voucher.code }}
                        </span>
                        <span
                          v-if="voucher.minOrderAmount !== undefined"
                          class="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded"
                        >
                          Đơn tối thiểu {{ formatPrice(voucher.minOrderAmount || 0) }}
                        </span>
                      </div>
                      <p class="text-xs text-gray-500 mb-1.5">
                        {{ getDiscountLabel(voucher) }}
                      </p>
                      <p v-if="voucher.description" class="text-xs text-gray-600 line-clamp-2">
                        {{ voucher.description }}
                      </p>
                      <p class="text-[11px] text-gray-400 mt-1.5">
                        HSD: {{ formatDate(voucher.expiresAt) }}
                      </p>
                    </div>

                    <!-- Check -->
                    <div
                      class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors"
                      :class="[
                        selectedVoucher?.id === voucher.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      ]"
                    >
                      <svg
                        v-if="selectedVoucher?.id === voucher.id"
                        class="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              </template>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div class="flex items-center gap-3">
                <button
                  v-if="selectedVoucher"
                  @click="selectedVoucher = null"
                  class="px-4 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Bỏ chọn
                </button>
                <button
                  @click="confirmSelection"
                  :disabled="!selectedVoucher || loading"
                  class="flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-200"
                  :class="[
                    selectedVoucher && !loading
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                      : 'bg-gray-300 cursor-not-allowed'
                  ]"
                >
                  {{ selectedVoucher ? 'Áp dụng voucher' : 'Chọn voucher để áp dụng' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
