<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

const accounts = ref([])
const loading = ref(true)
const showForm = ref(false)
const editingId = ref(null)
const form = ref({
  fullName: '',
  phone: '',
  province: '',
  district: '',
  ward: '',
  street: '',
  isDefault: false,
})
const saving = ref(false)

const user = computed(() => authStore.user)

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  await fetchAddresses()
})

async function fetchAddresses() {
  loading.value = true
  try {
    const api = useApi()
    const res = await api('/addresses')
    accounts.value = res.data || []
  } catch {
    toast.error('Không thể tải địa chỉ')
  } finally {
    loading.value = false
  }
}

function openCreateForm() {
  editingId.value = null
  form.value = { fullName: user.value?.name || '', phone: '', province: '', district: '', ward: '', street: '', isDefault: false }
  showForm.value = true
}

function openEditForm(address) {
  editingId.value = address.id
  form.value = {
    fullName: address.fullName || address.full_name || '',
    phone: address.phone || '',
    province: address.province || '',
    district: address.district || '',
    ward: address.ward || '',
    street: address.street || '',
    isDefault: address.isDefault || address.is_default || false,
  }
  showForm.value = true
}

async function saveAddress() {
  saving.value = true
  try {
    const api = useApi()
    const body = {
      full_name: form.value.fullName,
      phone: form.value.phone,
      province: form.value.province,
      district: form.value.district,
      ward: form.value.ward,
      street: form.value.street,
      is_default: form.value.isDefault,
    }
    if (editingId.value) {
      await api(`/addresses/${editingId.value}`, { method: 'PUT', body })
      toast.success('Cập nhật địa chỉ thành công')
    } else {
      await api('/addresses', { method: 'POST', body })
      toast.success('Thêm địa chỉ thành công')
    }
    showForm.value = false
    await fetchAddresses()
  } catch (e) {
    toast.error(e?.data?.message || 'Lưu thất bại')
  } finally {
    saving.value = false
  }
}

async function deleteAddress(id) {
  if (!confirm('Xóa địa chỉ này?')) return
  try {
    const api = useApi()
    await api(`/addresses/${id}`, { method: 'DELETE' })
    toast.success('Đã xóa địa chỉ')
    await fetchAddresses()
  } catch {
    toast.error('Xóa thất bại')
  }
}

async function setDefault(id) {
  try {
    const api = useApi()
    await api(`/addresses/${id}`, { method: 'PUT', body: { is_default: true } })
    toast.success('Đã đặt làm mặc định')
    await fetchAddresses()
  } catch {
    toast.error('Cập nhật thất bại')
  }
}

function formatAddress(a) {
  const parts = [a.street, a.ward, a.district, a.province].filter(Boolean)
  return parts.join(', ') || 'Chưa có địa chỉ chi tiết'
}
</script>

<template>
  <div class="page-container">
    <nav class="breadcrumb">
      <NuxtLink to="/">Trang chủ</NuxtLink>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-gray-900 font-medium">Tài khoản</span>
    </nav>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Sidebar -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl border border-gray-100 p-6 space-y-1">
          <NuxtLink
            to="/account"
            class="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary-50 text-primary-700 font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Địa chỉ của tôi
          </NuxtLink>
          <NuxtLink
            to="/my-orders"
            class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Đơn hàng
          </NuxtLink>
          <NuxtLink
            to="/wishlist"
            class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Yêu thích
          </NuxtLink>
        </div>
      </div>

      <!-- Content -->
      <div class="lg:col-span-3">
        <div class="bg-white rounded-xl border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900">Địa chỉ của tôi</h2>
            <button
              @click="openCreateForm"
              class="btn-primary btn-sm"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Thêm địa chỉ
            </button>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="space-y-3">
            <div v-for="i in 2" :key="i" class="h-24 skeleton rounded-xl"></div>
          </div>

          <!-- Empty State -->
          <div v-else-if="accounts.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p class="text-gray-500 mb-4">Bạn chưa có địa chỉ nào</p>
            <button @click="openCreateForm" class="btn-primary btn-sm">Thêm địa chỉ mới</button>
          </div>

          <!-- Address List -->
          <div v-else class="space-y-3">
            <div
              v-for="addr in accounts"
              :key="addr.id"
              class="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:border-primary-100 hover:bg-primary-50/30 transition-all"
            >
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-gray-900">{{ addr.fullName || addr.full_name }}</span>
                  <span class="text-sm text-gray-500">{{ addr.phone }}</span>
                  <span
                    v-if="addr.isDefault || addr.is_default"
                    class="px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] font-semibold rounded"
                  >
                    Mặc định
                  </span>
                </div>
                <p class="text-sm text-gray-600">{{ formatAddress(addr) }}</p>
              </div>
              <div class="flex items-center gap-2 ml-4">
                <button
                  v-if="!(addr.isDefault || addr.is_default)"
                  @click="setDefault(addr.id)"
                  class="text-xs text-primary-600 hover:text-primary-700 whitespace-nowrap"
                >
                  Đặt làm mặc định
                </button>
                <button
                  @click="openEditForm(addr)"
                  class="p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="deleteAddress(addr.id)"
                  class="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Address Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-content p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-900">{{ editingId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới' }}</h3>
          <button @click="showForm = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveAddress" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Họ và tên</label>
              <input v-model="form.fullName" type="text" class="input-field" required />
            </div>
            <div>
              <label class="label">Số điện thoại</label>
              <input v-model="form.phone" type="tel" class="input-field" required />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="label">Tỉnh/Thành phố</label>
              <input v-model="form.province" type="text" class="input-field" placeholder="Ví dụ: Hà Nội" />
            </div>
            <div>
              <label class="label">Quận/Huyện</label>
              <input v-model="form.district" type="text" class="input-field" placeholder="Ví dụ: Cầu Giấy" />
            </div>
            <div>
              <label class="label">Phường/Xã</label>
              <input v-model="form.ward" type="text" class="input-field" placeholder="Ví dụ: Dịch Vọng" />
            </div>
          </div>
          <div>
            <label class="label">Địa chỉ cụ thể</label>
            <input v-model="form.street" type="text" class="input-field" placeholder="Số nhà, tên đường" />
          </div>
          <div class="flex items-center gap-2">
            <input v-model="form.isDefault" type="checkbox" id="isDefault" class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <label for="isDefault" class="text-sm text-gray-700">Đặt làm địa chỉ mặc định</label>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showForm = false" class="btn-secondary btn-sm">Hủy</button>
            <button type="submit" :disabled="saving" class="btn-primary btn-sm">
              <div v-if="saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
              {{ saving ? 'Đang lưu...' : 'Lưu' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
