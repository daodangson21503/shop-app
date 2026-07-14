<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const categories = ref([])
const loading = ref(true)
const showModal = ref(false)
const editingCategory = ref(null)
const form = ref({ name: '', slug: '' })
const saving = ref(false)
const error = ref('')

async function fetchCategories() {
  loading.value = true
  try {
    const api = useApi()
    const res = await api('/categories')
    categories.value = res.data?.categories || res.data?.data || res.data || []
  } catch {
    categories.value = []
  } finally {
    loading.value = false
  }
}

function openAddModal() {
  editingCategory.value = null
  form.value = { name: '', slug: '' }
  error.value = ''
  showModal.value = true
}

function openEditModal(cat) {
  editingCategory.value = cat
  form.value = { name: cat.name, slug: cat.slug }
  error.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingCategory.value = null
}

async function saveCategory() {
  saving.value = true
  error.value = ''
  try {
    const api = useApi()
    const body = { name: form.value.name.trim(), slug: form.value.slug.trim() || undefined }
    if (editingCategory.value) {
      await api(`/categories/${editingCategory.value.id}`, { method: 'PUT', body })
    } else {
      await api('/categories', { method: 'POST', body })
    }
    closeModal()
    await fetchCategories()
  } catch (e) {
    error.value = e?.data?.message || e?.message || 'Lưu thất bại'
  } finally {
    saving.value = false
  }
}

async function deleteCategory(cat) {
  const productCount = cat.productCount || cat.product_count || 0
  if (productCount > 0) {
    if (!confirm(`Danh mục "${cat.name}" có ${productCount} sản phẩm. Bạn có chắc muốn xóa?`)) return
  } else {
    if (!confirm(`Xóa danh mục "${cat.name}"?`)) return
  }
  try {
    const api = useApi()
    await api(`/categories/${cat.id}`, { method: 'DELETE' })
    await fetchCategories()
  } catch {}
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-gray-900">Tất cả danh mục ({{ categories.length }})</h2>
      <button
        @click="openAddModal"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Thêm danh mục
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="categories.length === 0" class="text-center py-12 text-sm text-gray-400">
        Chưa có danh mục nào
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left py-3 px-4 text-gray-500 font-medium">Tên danh mục</th>
              <th class="text-left py-3 px-4 text-gray-500 font-medium">Slug</th>
              <th class="text-center py-3 px-4 text-gray-500 font-medium">Số sản phẩm</th>
              <th class="text-right py-3 px-4 text-gray-500 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in categories" :key="cat.id" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="py-3 px-4 font-medium text-gray-900">{{ cat.name }}</td>
              <td class="py-3 px-4 text-gray-500 font-mono text-xs">{{ cat.slug }}</td>
              <td class="py-3 px-4 text-center text-gray-700">{{ cat.productCount || cat.product_count || 0 }}</td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="openEditModal(cat)"
                    class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Sửa"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteCategory(cat)"
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
          <div class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 class="text-lg font-bold text-gray-900">{{ editingCategory ? 'Sửa danh mục' : 'Thêm danh mục' }}</h3>
              <button @click="closeModal" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
                <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input v-model="form.slug" type="text" placeholder="Để trống để tự động tạo" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
            </div>
            <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button @click="closeModal" class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">Hủy</button>
              <button
                @click="saveCategory"
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
