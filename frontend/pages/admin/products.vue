<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCategoryStore } from '~/stores/category'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const categoryStore = useCategoryStore()

const products = ref([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)
const searchQuery = ref('')
const showModal = ref(false)
const editingProduct = ref(null)
const form = ref({
  name: '',
  slug: '',
  price: 0,
  originalPrice: null,
  description: '',
  categoryId: null,
  stock: 0,
  status: 'active',
  thumbnail: null,
  attributes: [],
})
const saving = ref(false)
const uploadError = ref('')
const deleting = ref({})
let searchTimer = null

const categories = computed(() => categoryStore.categories)

const stats = computed(() => {
  const total = totalCount.value || products.value.length
  const inStock = products.value.filter((p) => (p.stock || p.quantity || 0) > 0).length
  const outOfStock = products.value.filter((p) => (p.stock || p.quantity || 0) === 0).length
  return { total, inStock, outOfStock }
})

function formatPrice(val) {
  return new Intl.NumberFormat('vi-VN').format(val) + 'đ'
}

async function fetchProducts() {
  loading.value = true
  try {
    const api = useApi()
    const params = { page: currentPage.value, limit: 15 }
    if (searchQuery.value.trim()) params.search = searchQuery.value.trim()
    const res = await api('/products', { params })
    const data = res.data
    products.value = data?.products || data?.data || data || []
    totalCount.value = data?.total || products.value.length
    totalPages.value = data?.totalPages || Math.ceil((totalCount.value || 0) / 15) || 1
  } catch {
    products.value = []
  } finally {
    loading.value = false
  }
}

function openAddModal() {
  editingProduct.value = null
  form.value = { name: '', slug: '', price: 0, originalPrice: null, description: '', categoryId: null, stock: 0, status: 'active', thumbnail: null, attributes: [] }
  uploadError.value = ''
  showModal.value = true
}

function openEditModal(product) {
  editingProduct.value = product
  form.value = {
    name: product.name,
    slug: product.slug,
    price: product.price,
    originalPrice: product.originalPrice || product.original_price || null,
    description: product.description || '',
    categoryId: product.categoryId || product.category_id || null,
    stock: product.stock || product.quantity || 0,
    status: product.isActive ? 'active' : 'inactive',
    thumbnail: null,
    attributes: product.attributes ? product.attributes.map(a => ({ name: a.name, value: a.value })) : [],
  }
  uploadError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingProduct.value = null
}

async function handleImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { uploadError.value = 'Vui lòng chọn file ảnh'; return }
  if (file.size > 5 * 1024 * 1024) { uploadError.value = 'Ảnh không được quá 5MB'; return }

  try {
    const api = useApi()
    const fd = new FormData()
    fd.append('image', file)
    const res = await api('/upload/image', { method: 'POST', body: fd })
    form.value.thumbnail = res.data?.url || res.data?.path || ''
    uploadError.value = ''
  } catch {
    uploadError.value = 'Tải ảnh thất bại'
  }
}

async function saveProduct() {
  saving.value = true
  try {
    const api = useApi()
    const body = {
      name: form.value.name,
      slug: form.value.slug,
      price: form.value.price,
      originalPrice: form.value.originalPrice || undefined,
      stock: form.value.stock,
      description: form.value.description,
      image_url: form.value.thumbnail,
      category_id: form.value.categoryId,
      isActive: form.value.status === 'active',
      attributes: form.value.attributes.filter(a => a.name.trim() && a.value.trim()),
    }
    if (editingProduct.value) {
      await api(`/products/${editingProduct.value.id}`, { method: 'PUT', body })
    } else {
      await api('/products', { method: 'POST', body })
    }
    closeModal()
    await fetchProducts()
  } catch (e) {
    uploadError.value = e?.data?.message || e?.message || 'Lưu thất bại'
  } finally {
    saving.value = false
  }
}

async function deleteProduct(product) {
  if (!window.confirm(`Xóa sản phẩm "${product.name}"?`)) return
  deleting.value[product.id] = true
  try {
    const api = useApi()
    await api(`/products/${product.id}`, { method: 'DELETE' })
    await fetchProducts()
  } catch {
  } finally {
    deleting.value[product.id] = false
  }
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchProducts()
}

function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    fetchProducts()
  }, 350)
}

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div>
    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <p class="text-xs text-gray-500 uppercase">Tổng sản phẩm</p>
        <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <p class="text-xs text-gray-500 uppercase">Còn hàng</p>
        <p class="text-2xl font-bold text-green-600">{{ stats.inStock }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <p class="text-xs text-gray-500 uppercase">Hết hàng</p>
        <p class="text-2xl font-bold text-red-600">{{ stats.outOfStock }}</p>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
      <div class="relative flex-1 max-w-xs">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          @input="onSearchInput"
          class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <button
        @click="openAddModal"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Thêm sản phẩm
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="products.length === 0" class="text-center py-12 text-sm text-gray-400">
        Không có sản phẩm nào
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left py-3 px-4 text-gray-500 font-medium">Sản phẩm</th>
              <th class="text-right py-3 px-4 text-gray-500 font-medium">Giá</th>
              <th class="text-center py-3 px-4 text-gray-500 font-medium">Tồn kho</th>
              <th class="text-left py-3 px-4 text-gray-500 font-medium">Danh mục</th>
              <th class="text-center py-3 px-4 text-gray-500 font-medium">Trạng thái</th>
              <th class="text-right py-3 px-4 text-gray-500 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="product.imageUrl || '/placeholder-product.png'"
                    :alt="product.name"
                    class="w-10 h-10 rounded-lg object-contain bg-[#f5f5f5] p-1 flex-shrink-0"
                  />
                  <span class="text-gray-900 font-medium truncate max-w-[200px]">{{ product.name }}</span>
                </div>
              </td>
              <td class="py-3 px-4 text-right font-medium text-gray-900">{{ formatPrice(product.price) }}</td>
              <td class="py-3 px-4 text-center">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="(product.stock || product.quantity || 0) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  {{ product.stock || product.quantity || 0 }}
                </span>
              </td>
              <td class="py-3 px-4 text-gray-600">{{ product.categoryName || '---' }}</td>
              <td class="py-3 px-4 text-center">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                >
                  {{ product.isActive ? 'Đang bán' : 'Ẩn' }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="openEditModal(product)"
                    class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Sửa"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteProduct(product)"
                    :disabled="deleting[product.id]"
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

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 px-4 py-4 border-t border-gray-100">
        <button
          :disabled="currentPage <= 1"
          @click="changePage(currentPage - 1)"
          class="px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          Trước
        </button>
        <button
          v-for="p in visiblePages"
          :key="p"
          @click="typeof p === 'number' && changePage(p)"
          class="w-8 h-8 rounded text-sm font-medium"
          :class="p === '...' ? 'border-0 cursor-default' : p === currentPage ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'"
        >
          {{ p }}
        </button>
        <button
          :disabled="currentPage >= totalPages"
          @click="changePage(currentPage + 1)"
          class="px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          Sau
        </button>
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
          <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 class="text-lg font-bold text-gray-900">{{ editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm' }}</h3>
              <button @click="closeModal" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="flex-1 overflow-y-auto p-6 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                  <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input v-model="form.slug" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
                  <input v-model.number="form.price" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Giá gốc</label>
                  <input v-model.number="form.originalPrice" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                  <input v-model.number="form.stock" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select v-model.number="form.categoryId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option :value="null">Chọn danh mục</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select v-model="form.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="active">Đang bán</option>
                    <option value="inactive">Ẩn</option>
                  </select>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea v-model="form.description" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Ảnh sản phẩm</label>
                  <div class="flex items-center gap-4">
                    <label class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 text-sm transition-colors">
                      Chọn ảnh
                      <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
                    </label>
                    <img
                      v-if="form.thumbnail || editingProduct?.imageUrl"
                      :src="form.thumbnail || editingProduct?.imageUrl"
                      class="w-16 h-16 rounded-lg object-contain bg-[#f5f5f5] p-1"
                    />
                  </div>
                  <p v-if="uploadError" class="text-xs text-red-500 mt-1">{{ uploadError }}</p>
                </div>

                <!-- Product Attributes Editor -->
                <div class="col-span-2 border-t border-gray-100 pt-4 mt-2">
                  <div class="flex items-center justify-between mb-3">
                    <label class="block text-sm font-medium text-gray-700">Thuộc tính sản phẩm</label>
                    <button
                      type="button"
                      @click="form.attributes.push({ name: '', value: '' })"
                      class="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Thêm thuộc tính
                    </button>
                  </div>
                  <div v-if="form.attributes.length === 0" class="text-xs text-gray-400 italic">Chưa có thuộc tính nào</div>
                  <div v-for="(attr, idx) in form.attributes" :key="idx" class="flex items-center gap-2 mb-2">
                    <input
                      v-model="attr.name"
                      type="text"
                      placeholder="Tên (vd: Chất liệu)"
                      class="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      v-model="attr.value"
                      type="text"
                      placeholder="Giá trị (vd: Inox)"
                      class="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      @click="form.attributes.splice(idx, 1)"
                      class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button @click="closeModal" class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">Hủy</button>
              <button
                @click="saveProduct"
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
