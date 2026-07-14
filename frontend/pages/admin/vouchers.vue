<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const vouchers = ref([])
const loading = ref(true)
const showModal = ref(false)
const editingVoucher = ref(null)
const form = ref({
  code: '',
  discountType: 'fixed',
  discountValue: 0,
  minOrder: 0,
  maxDiscount: null,
  quantity: 0,
  expiryDate: '',
  description: '',
  isActive: true,
})
const saving = ref(false)
const error = ref('')

const stats = computed(() => {
  const now = new Date()
  const total = vouchers.value.length
  const active = vouchers.value.filter((v) => {
    if (v.isActive === false) return false
    const exp = v.expiresAt || v.expires_at || v.end_date
    return (!exp || new Date(exp) > now) && (v.quantity || v.usageLimit || 0) > (v.usedCount || v.used || 0)
  }).length
  const expired = vouchers.value.filter((v) => {
    const exp = v.expiresAt || v.expires_at || v.end_date
    return exp && new Date(exp) <= now
  }).length
  return { total, active, expired }
})

function formatPrice(val) {
  return new Intl.NumberFormat('vi-VN').format(val) + 'đ'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function isExpired(voucher) {
  const exp = voucher.expiresAt || voucher.expires_at || voucher.end_date
  return exp && new Date(exp) <= new Date()
}

function getStatus(v) {
  if (v.isActive === false) return 'inactive'
  if (isExpired(v)) return 'expired'
  const qty = v.quantity || v.usageLimit || 0
  const used = v.usedCount || v.used || 0
  if (qty > 0 && used >= qty) return 'expired'
  return 'active'
}

function getStatusBadge(v) {
  const s = getStatus(v)
  if (s === 'active') return { class: 'bg-green-100 text-green-700', label: 'Đang áp dụng' }
  if (s === 'inactive') return { class: 'bg-gray-100 text-gray-600', label: 'Tạm dừng' }
  return { class: 'bg-red-100 text-red-700', label: 'Hết hạn' }
}

async function fetchVouchers() {
  loading.value = true
  try {
    const api = useApi()
    const res = await api('/vouchers')
    vouchers.value = res.data?.vouchers || res.data?.data || res.data || []
  } catch {
    vouchers.value = []
  } finally {
    loading.value = false
  }
}

function openAddModal() {
  editingVoucher.value = null
  form.value = { code: '', discountType: 'fixed', discountValue: 0, minOrder: 0, maxDiscount: null, quantity: 0, expiryDate: '', description: '', isActive: true }
  error.value = ''
  showModal.value = true
}

function openEditModal(v) {
  editingVoucher.value = v
  form.value = {
    code: v.code,
    discountType: v.discountType === 'percent' ? 'percentage' : 'fixed',
    discountValue: Number(v.discountValue || v.discount_value || 0),
    minOrder: Number(v.minOrderAmount || v.min_order_amount || 0),
    maxDiscount: Number(v.maxDiscount || v.max_discount || 0) || null,
    quantity: v.quantity || v.usageLimit || 0,
    expiryDate: v.expiryDate || v.expiresAt || v.expires_at || v.end_date || '',
    description: v.description || '',
    isActive: v.isActive !== undefined ? v.isActive : true,
  }
  error.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingVoucher.value = null
}

async function saveVoucher() {
  saving.value = true
  error.value = ''
  try {
    const api = useApi()
    const body = {
      code: form.value.code.trim(),
      discount_type: form.value.discountType === 'percentage' ? 'percent' : 'fixed',
      discount_value: form.value.discountValue,
      min_order_amount: form.value.minOrder,
      max_discount: form.value.maxDiscount || undefined,
      quantity: form.value.quantity,
      expires_at: form.value.expiryDate || null,
      description: form.value.description.trim(),
      is_active: form.value.isActive,
    }
    if (editingVoucher.value) {
      await api(`/vouchers/${editingVoucher.value.id}`, { method: 'PUT', body })
    } else {
      await api('/vouchers', { method: 'POST', body })
    }
    closeModal()
    await fetchVouchers()
  } catch (e) {
    error.value = e?.data?.message || e?.message || 'Lưu thất bại'
  } finally {
    saving.value = false
  }
}

async function deleteVoucher(v) {
  if (!confirm(`Xóa voucher "${v.code}"?`)) return
  try {
    const api = useApi()
    await api(`/vouchers/${v.id}`, { method: 'DELETE' })
    await fetchVouchers()
  } catch {}
}

onMounted(() => {
  fetchVouchers()
})
</script>

<template>
  <div>
    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <p class="text-xs text-gray-500 uppercase">Tổng số</p>
        <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <p class="text-xs text-gray-500 uppercase">Đang áp dụng</p>
        <p class="text-2xl font-bold text-green-600">{{ stats.active }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <p class="text-xs text-gray-500 uppercase">Hết hạn</p>
        <p class="text-2xl font-bold text-red-600">{{ stats.expired }}</p>
      </div>
    </div>

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-gray-900">Danh sách voucher</h2>
      <button
        @click="openAddModal"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Thêm voucher
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="vouchers.length === 0" class="text-center py-12 text-sm text-gray-400">
        Chưa có voucher nào
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left py-3 px-4 text-gray-500 font-medium">Mã</th>
              <th class="text-left py-3 px-4 text-gray-500 font-medium">Loại</th>
              <th class="text-right py-3 px-4 text-gray-500 font-medium">Giá trị</th>
              <th class="text-right py-3 px-4 text-gray-500 font-medium">Đơn tối thiểu</th>
              <th class="text-center py-3 px-4 text-gray-500 font-medium">SL / Đã dùng</th>
              <th class="text-left py-3 px-4 text-gray-500 font-medium">Hết hạn</th>
              <th class="text-center py-3 px-4 text-gray-500 font-medium">Trạng thái</th>
              <th class="text-right py-3 px-4 text-gray-500 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in vouchers" :key="v.id" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="py-3 px-4 font-mono font-bold text-gray-900">{{ v.code }}</td>
              <td class="py-3 px-4 text-gray-600">
                {{ (v.discountType || v.discount_type) === 'percent' ? '%' : 'VNĐ' }}
              </td>
              <td class="py-3 px-4 text-right font-medium text-gray-900">
                {{ (v.discountType || v.discount_type) === 'percent' ? `${v.discountValue || v.discount_value}%` : formatPrice(v.discountValue || v.discount_value) }}
              </td>
              <td class="py-3 px-4 text-right text-gray-600">{{ formatPrice(v.minOrderAmount || 0) }}</td>
              <td class="py-3 px-4 text-center text-gray-700">
                {{ v.usedCount || v.used || 0 }} / {{ v.quantity || v.usageLimit || '∞' }}
              </td>
              <td class="py-3 px-4 text-gray-500 text-xs">{{ formatDate(v.expiresAt || v.expires_at || v.end_date) }}</td>
              <td class="py-3 px-4 text-center">
                <span class="px-2.5 py-1 rounded-full text-xs font-medium" :class="getStatusBadge(v).class">
                  {{ getStatusBadge(v).label }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="openEditModal(v)"
                    class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Sửa"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteVoucher(v)"
                    class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal"></div>
          <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 class="text-lg font-bold text-gray-900">{{ editingVoucher ? 'Sửa voucher' : 'Thêm voucher' }}</h3>
              <button @click="closeModal" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Mã voucher</label>
                <input v-model="form.code" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Loại</label>
                  <select v-model="form.discountType" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="fixed">Số tiền cố định</option>
                    <option value="percentage">Phần trăm</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Giá trị</label>
                  <input v-model.number="form.discountValue" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Đơn tối thiểu</label>
                  <input v-model.number="form.minOrder" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa</label>
                  <input v-model.number="form.maxDiscount" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                  <input v-model.number="form.quantity" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label>
                  <input v-model="form.expiryDate" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select v-model="form.isActive" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option :value="true">Đang áp dụng</option>
                    <option :value="false">Tạm dừng</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea v-model="form.description" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
              </div>
              <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
            </div>
            <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button @click="closeModal" class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">Hủy</button>
              <button
                @click="saveVoucher"
                :disabled="saving"
                class="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center gap-2"
              >
                <div v-if="saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ saving ? 'Đang lưu...' : 'Lưu' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
