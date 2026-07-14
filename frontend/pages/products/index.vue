<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useProductStore } from '~/stores/product'
import { useCategoryStore } from '~/stores/category'

definePageMeta({ layout: 'default' })

const productStore = useProductStore()
const categoryStore = useCategoryStore()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const products = ref([])
const totalPages = ref(1)
const currentPage = ref(1)
const sortOrder = ref('')
const selectedCategory = ref(null)

const searchKeyword = computed(() => route.query.search || '')
const pageQuery = computed(() => parseInt(String(route.query.page || '')) || 1)

const categories = computed(() => categoryStore.categories)

async function loadProducts() {
  loading.value = true
  try {
    const params = { page: currentPage.value, limit: 12 }
    if (searchKeyword.value) params.search = searchKeyword.value
    if (selectedCategory.value) params.category = selectedCategory.value
    if (sortOrder.value) params.sort = sortOrder.value

    const api = useApi()
    const res = await api('/products', { params })
    products.value = res.data?.products || res.data?.data || res.data || []
    if (res.data?.totalPages) totalPages.value = res.data.totalPages
    else if (res.data?.total) totalPages.value = Math.ceil(res.data.total / 12)
    else totalPages.value = 1
  } catch (e) {
    products.value = []
  } finally {
    loading.value = false
  }
}

function onCategoryChange(id) {
  selectedCategory.value = id
  currentPage.value = 1
  router.push({ query: { ...route.query, category: id || undefined, page: 1 } })
  loadProducts()
}

function changePage(page) {
  currentPage.value = page
  router.push({ query: { ...route.query, page } })
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onSortChange() {
  currentPage.value = 1
  loadProducts()
}

watch(searchKeyword, () => {
  currentPage.value = 1
  loadProducts()
})

const paginationRange = computed(() => {
  const range = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) range.push(i)
  return range
})

onMounted(async () => {
  currentPage.value = pageQuery.value
  if (route.query.category) selectedCategory.value = parseInt(String(route.query.category))
  if (route.query.sort) sortOrder.value = String(route.query.sort)
  await Promise.all([categoryStore.fetchCategories(), loadProducts()])
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <NuxtLink to="/" class="hover:text-blue-600 transition-colors">Trang chủ</NuxtLink>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-gray-900 font-medium">Sản phẩm</span>
    </nav>

    <!-- Page Title -->
    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
      {{ searchKeyword ? `Kết quả tìm kiếm: "${searchKeyword}"` : 'Tất cả sản phẩm' }}
    </h1>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Sidebar -->
      <div class="w-full lg:w-64 flex-shrink-0">
        <CategorySidebar
          :categories="categories"
          :model-value="selectedCategory"
          @update:model-value="onCategoryChange"
        />
      </div>

      <!-- Main Content -->
      <div class="flex-1 min-w-0">
        <!-- Sort & Info -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <p class="text-sm text-gray-500">
            Hiển thị <span class="font-medium text-gray-900">{{ products.length }}</span> sản phẩm
          </p>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Sắp xếp:</label>
            <select
              v-model="sortOrder"
              @change="onSortChange"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Mặc định</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
            </select>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-20">
          <div class="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p class="text-sm text-gray-500">Đang tải sản phẩm...</p>
        </div>

        <!-- Product Grid -->
        <div v-else-if="products.length > 0">
          <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <ProductCard v-for="product in products" :key="product.id" :product="product" />
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-10">
            <button
              :disabled="currentPage <= 1"
              @click="changePage(currentPage - 1)"
              class="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              v-for="p in paginationRange"
              :key="p"
              @click="changePage(p)"
              class="min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors"
              :class="[
                p === currentPage
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              ]"
            >
              {{ p }}
            </button>

            <button
              :disabled="currentPage >= totalPages"
              @click="changePage(currentPage + 1)"
              class="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Empty -->
        <div v-else class="flex flex-col items-center justify-center py-20 text-center">
          <svg class="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 class="text-lg font-medium text-gray-600 mb-1">Không tìm thấy sản phẩm</h3>
          <p class="text-sm text-gray-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          <NuxtLink
            to="/products"
            class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Xóa bộ lọc
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
