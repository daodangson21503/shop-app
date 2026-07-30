<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'default' })

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const addresses = ref([])
const selectedAddressId = ref(null)
const customerName = ref('')
const customerPhone = ref('')
const customerProvince = ref('')
const customerDistrict = ref('')
const customerWard = ref('')
const customerStreet = ref('')
const voucherCode = ref('')
const showVoucherModal = ref(false)
const appliedVoucher = ref(null)
const discountAmount = ref(0)
const submitting = ref(false)
const errors = ref({})
const orderSuccess = ref(false)
const loadingAddresses = ref(true)
const useNewAddress = ref(false)
const shippingNote = ref('')
const shippingInfo = ref({ fee: 0, estimatedDays: '', message: '' })
const loadingShipping = ref(false)

const items = computed(() => cartStore.items)
const isEmpty = computed(() => items.value.length === 0)
const subtotal = computed(() => cartStore.total)
const totalWeight = computed(() =>
  items.value.reduce((sum, i) => sum + (Number(i.weight) || 0.5) * i.quantity, 0)
)
const shippingFee = computed(() => shippingInfo.value.fee)
const total = computed(() => Math.max(0, subtotal.value - discountAmount.value + shippingFee.value))

const selectedAddress = computed(() => addresses.value.find((a) => a.id === selectedAddressId.value))

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

async function calculateShipping() {
  const province = customerProvince.value.trim()
  if (!province || items.value.length === 0) return
  loadingShipping.value = true
  try {
    const api = useApi()
    const res = await api(`/shipping/calculate?province=${encodeURIComponent(province)}&subtotal=${subtotal.value}&weight=${totalWeight.value}`)
    shippingInfo.value = res
  } catch {
    shippingInfo.value = { fee: 30000, estimatedDays: '3-5 ngày', message: 'Phí vận chuyển mặc định' }
  } finally {
    loadingShipping.value = false
  }
}

watch([customerProvince, subtotal], () => {
  calculateShipping()
})

function onVoucherApply(result) {
  appliedVoucher.value = result.voucher
  discountAmount.value = result.discountAmount
  voucherCode.value = result.voucher.code
}

function removeVoucher() {
  appliedVoucher.value = null
  discountAmount.value = 0
  voucherCode.value = ''
}

function selectAddress(addr) {
  selectedAddressId.value = addr.id
  useNewAddress.value = false
  customerName.value = addr.fullName || addr.full_name || ''
  customerPhone.value = addr.phone || ''
  customerProvince.value = addr.province || ''
  customerDistrict.value = addr.district || ''
  customerWard.value = addr.ward || ''
  customerStreet.value = addr.street || ''
}

function useNewAddr() {
  useNewAddress.value = true
  selectedAddressId.value = null
  customerName.value = ''
  customerPhone.value = ''
  customerProvince.value = ''
  customerDistrict.value = ''
  customerWard.value = ''
  customerStreet.value = ''
}

function validate() {
  const errs = {}
  if (!customerName.value.trim()) errs.name = 'Vui lòng nhập họ tên'
  if (!customerPhone.value.trim()) errs.phone = 'Vui lòng nhập số điện thoại'
  else if (!/^(0|\+84)[3-9][0-9]{8}$/.test(customerPhone.value.trim())) errs.phone = 'Số điện thoại không hợp lệ'
  if (!customerStreet.value.trim()) errs.address = 'Vui lòng nhập địa chỉ'
  errors.value = errs
  return Object.keys(errs).length === 0
}

async function placeOrder() {
  if (!validate()) return

  submitting.value = true
  try {
    const api = useApi()
    const body = {
      customer_name: customerName.value.trim(),
      customer_phone: customerPhone.value.trim(),
      customer_address: [customerStreet.value.trim(), customerWard.value.trim(), customerDistrict.value.trim(), customerProvince.value.trim()].filter(Boolean).join(', '),
      customer_province: customerProvince.value.trim(),
      customer_district: customerDistrict.value.trim(),
      customer_ward: customerWard.value.trim(),
      shipping_fee: shippingFee.value,
      note: shippingNote.value.trim(),
      user_id: authStore.user?.id,
      items: items.value.map((i) => ({
        product_id: i.id,
        quantity: i.quantity,
        price: i.price,
      })),
    }
    if (appliedVoucher.value) {
      body.voucher_code = appliedVoucher.value.code
    }

    await api('/orders', { method: 'POST', body })
    cartStore.clear()
    orderSuccess.value = true
    toast.success('Đặt hàng thành công!')
  } catch (e) {
    const msg = e?.data?.message || e?.message || 'Đặt hàng thất bại. Vui lòng thử lại.'
    errors.value = { submit: msg }
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (isEmpty.value && !orderSuccess.value) {
    router.push('/cart')
    return
  }
  if (authStore.isLoggedIn) {
    try {
      const api = useApi()
      const res = await api('/addresses')
      addresses.value = res.data || []
      const defaultAddr = addresses.value.find((a) => a.isDefault || a.is_default)
      if (defaultAddr) {
        selectAddress(defaultAddr)
      }
      if (customerProvince.value) {
        calculateShipping()
      }
    } catch {
      // ignore
    } finally {
      loadingAddresses.value = false
    }
  }
})
</script>

<template>
  <div class="page-container">
    <nav class="breadcrumb">
      <NuxtLink to="/">Trang chủ</NuxtLink>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <NuxtLink to="/cart" class="hover:text-primary-600">Giỏ hàng</NuxtLink>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-gray-900 font-medium">Thanh toán</span>
    </nav>

    <!-- Success State -->
    <div v-if="orderSuccess" class="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
        <svg class="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h2>
      <p class="text-gray-500 mb-8">Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ sớm nhất.</p>
      <div class="flex gap-3">
        <NuxtLink to="/my-orders" class="btn-primary">Xem đơn hàng</NuxtLink>
        <NuxtLink to="/" class="btn-secondary">Về trang chủ</NuxtLink>
      </div>
    </div>

    <!-- Checkout Form -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Address Selection -->
        <div v-if="addresses.length > 0 && !useNewAddress" class="card p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Địa chỉ giao hàng</h2>
          <div class="space-y-2">
            <div
              v-for="addr in addresses"
              :key="addr.id"
              @click="selectAddress(addr)"
              class="flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all"
              :class="selectedAddressId === addr.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <div class="mt-0.5">
                <div
                  class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  :class="selectedAddressId === addr.id ? 'border-primary-500' : 'border-gray-300'"
                >
                  <div v-if="selectedAddressId === addr.id" class="w-3 h-3 bg-primary-500 rounded-full"></div>
                </div>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-900">{{ addr.fullName || addr.full_name }}</span>
                  <span class="text-sm text-gray-500">{{ addr.phone }}</span>
                  <span v-if="addr.isDefault || addr.is_default" class="badge-primary text-[10px]">Mặc định</span>
                </div>
                <p class="text-sm text-gray-600 mt-0.5">{{ [addr.street, addr.ward, addr.district, addr.province].filter(Boolean).join(', ') }}</p>
              </div>
            </div>
          </div>
          <button @click="useNewAddr" class="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium">
            + Giao đến địa chỉ khác
          </button>
        </div>

        <!-- Address Form -->
        <div class="card p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">
            {{ selectedAddress && !useNewAddress ? 'Thông tin giao hàng' : 'Thông tin giao hàng' }}
          </h2>

          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label">Họ và tên <span class="text-red-500">*</span></label>
                <input
                  v-model="customerName"
                  type="text"
                  placeholder="Họ và tên"
                  class="input-field"
                  :class="{ 'input-error': errors.name }"
                />
                <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name }}</p>
              </div>
              <div>
                <label class="label">Số điện thoại <span class="text-red-500">*</span></label>
                <input
                  v-model="customerPhone"
                  type="tel"
                  placeholder="Số điện thoại"
                  class="input-field"
                  :class="{ 'input-error': errors.phone }"
                />
                <p v-if="errors.phone" class="text-xs text-red-500 mt-1">{{ errors.phone }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="label">Tỉnh/Thành phố</label>
                <input v-model="customerProvince" type="text" class="input-field" placeholder="Tỉnh/Thành phố" />
              </div>
              <div>
                <label class="label">Quận/Huyện</label>
                <input v-model="customerDistrict" type="text" class="input-field" placeholder="Quận/Huyện" />
              </div>
              <div>
                <label class="label">Phường/Xã</label>
                <input v-model="customerWard" type="text" class="input-field" placeholder="Phường/Xã" />
              </div>
            </div>

            <div>
              <label class="label">Địa chỉ <span class="text-red-500">*</span></label>
              <input
                v-model="customerStreet"
                type="text"
                placeholder="Số nhà, tên đường"
                class="input-field"
                :class="{ 'input-error': errors.address }"
              />
              <p v-if="errors.address" class="text-xs text-red-500 mt-1">{{ errors.address }}</p>
            </div>

            <div>
              <label class="label">Ghi chú</label>
              <textarea
                v-model="shippingNote"
                rows="2"
                class="input-field resize-none"
                placeholder="Ghi chú cho người giao hàng (không bắt buộc)"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="card p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Phương thức thanh toán</h2>
          <div class="flex items-center gap-3 p-4 border-2 border-primary-500 bg-primary-50 rounded-xl">
            <div class="w-5 h-5 rounded-full border-2 border-primary-500 flex items-center justify-center">
              <div class="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</p>
              <p class="text-xs text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="lg:col-span-1">
        <div class="card p-6 sticky top-24 space-y-4">
          <h3 class="text-lg font-bold text-gray-900">Đơn hàng</h3>

          <div class="space-y-3 max-h-60 overflow-y-auto">
            <div
              v-for="item in items"
              :key="item.id"
              class="flex items-center gap-3"
            >
              <img
                :src="item.imageUrl || '/placeholder-product.png'"
                :alt="item.name"
                class="w-12 h-12 rounded-lg object-contain bg-[#f5f5f5] p-1 flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-700 truncate">{{ item.name }}</p>
                <p class="text-xs text-gray-400">SL: {{ item.quantity }}</p>
              </div>
              <span class="text-sm font-medium text-gray-900">{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>

          <!-- Voucher -->
          <div class="border-t border-gray-100 pt-4">
            <div v-if="!appliedVoucher">
              <div class="flex gap-2">
                <input
                  v-model="voucherCode"
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  @click="showVoucherModal = true"
                  class="px-4 py-2 text-sm text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors whitespace-nowrap"
                >
                  Chọn voucher
                </button>
              </div>
            </div>
            <div v-else class="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2">
              <div>
                <p class="text-sm font-medium text-emerald-700">{{ appliedVoucher.code }}</p>
                <p class="text-xs text-emerald-600">Giảm {{ formatPrice(discountAmount) }}</p>
              </div>
              <button @click="removeVoucher" class="text-red-500 hover:text-red-700">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Totals -->
          <div class="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Tạm tính</span>
              <span class="text-gray-900">{{ formatPrice(subtotal) }}</span>
            </div>
            <div v-if="discountAmount > 0" class="flex justify-between">
              <span class="text-gray-500">Giảm giá</span>
              <span class="text-emerald-600">-{{ formatPrice(discountAmount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Phí vận chuyển</span>
              <span :class="shippingFee === 0 ? 'text-emerald-600 font-medium' : 'text-gray-900'">
                <span v-if="loadingShipping" class="text-gray-400">Đang tính...</span>
                <span v-else-if="shippingFee === 0">Miễn phí</span>
                <span v-else>{{ formatPrice(shippingFee) }}</span>
              </span>
            </div>
            <div v-if="shippingInfo.estimatedDays && !loadingShipping" class="flex justify-between text-xs">
              <span class="text-gray-400">Thời gian giao</span>
              <span class="text-gray-500">{{ shippingInfo.estimatedDays }}</span>
            </div>
            <div class="border-t border-gray-100 pt-3 flex justify-between">
              <span class="text-base font-bold text-gray-900">Tổng cộng</span>
              <span class="text-lg font-bold text-red-600">{{ formatPrice(total) }}</span>
            </div>
          </div>

          <p v-if="errors.submit" class="text-xs text-red-500 text-center">{{ errors.submit }}</p>

          <button
            @click="placeOrder"
            :disabled="submitting"
            class="w-full py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <div v-if="submitting" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ submitting ? 'Đang xử lý...' : 'Đặt hàng' }}
          </button>

          <p class="text-xs text-gray-400 text-center">Bạn chỉ phải thanh toán khi nhận hàng</p>
        </div>
      </div>
    </div>

    <VoucherModal
      v-model="showVoucherModal"
      :order-amount="subtotal"
      @apply="onVoucherApply"
    />
  </div>
</template>
