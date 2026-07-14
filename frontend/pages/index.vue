<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '~/stores/product'
import { useCategoryStore } from '~/stores/category'

const productStore = useProductStore()
const categoryStore = useCategoryStore()
const router = useRouter()

const loading = ref(true)
const sliders = ref([])
const featuredProducts = ref([])
const keyword = ref('')

const categories = computed(() => categoryStore.categories)
const products = computed(() => productStore.products)

const groupedSections = computed(() => {
  if (keyword.value) {
    const kw = keyword.value.toLowerCase().trim()
    const filtered = products.value.filter((p) => p.name.toLowerCase().includes(kw))
    return [{ title: `Kết quả tìm kiếm: "${keyword.value}"`, products: filtered }]
  }
  const groups = []
  const categoryMap = new Map()
  categories.value.forEach((c) => categoryMap.set(c.id, c.name))

  const grouped = new Map()
  products.value.forEach((p) => {
    const catId = p.categoryId || p.category_id
    if (!grouped.has(catId)) grouped.set(catId, [])
    grouped.get(catId).push(p)
  })

  for (const [catId, catProducts] of grouped) {
    const name = categoryMap.get(catId) || 'Sản phẩm'
    groups.push({ title: name, products: catProducts, categoryId: catId })
  }
  if (groups.length === 0) {
    groups.push({ title: 'Sản phẩm', products: products.value })
  }
  return groups
})

const currentSlide = ref(0)
let slideInterval = null

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % sliders.value.length
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + sliders.value.length) % sliders.value.length
}

function goToSlide(index) {
  currentSlide.value = index
}

onMounted(async () => {
  loading.value = true
  try {
    const api = useApi()
    const [slidersRes, featuredRes] = await Promise.all([
      api('/sliders').catch(() => ({ data: [] })),
      api('/products', { params: { featured: true, limit: 10 } }).catch(() => ({ data: { products: [] } })),
      productStore.fetchProducts({ limit: 100 }),
      categoryStore.fetchCategories(),
    ])
    sliders.value = slidersRes.data || []
    featuredProducts.value = featuredRes.data?.products || []
  } finally {
    loading.value = false
  }

  if (sliders.value.length > 1) {
    slideInterval = setInterval(nextSlide, 5000)
  }
})

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
})

function handleSearch() {
  if (keyword.value.trim()) {
    router.push({ path: '/products', query: { search: keyword.value.trim() } })
  } else {
    router.push('/products')
  }
}
</script>

<template>
  <div>
    <!-- Hero Slider -->
    <section v-if="sliders.length > 0" class="relative overflow-hidden bg-gray-900">
      <div class="relative h-[300px] md:h-[450px]">
        <div
          v-for="(slide, index) in sliders"
          :key="index"
          class="absolute inset-0 transition-opacity duration-700 ease-in-out"
          :class="index === currentSlide ? 'opacity-100' : 'opacity-0'"
        >
          <img
            :src="slide.imageUrl"
            :alt="slide.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
          <div class="absolute inset-0 flex items-center">
            <div class="max-w-7xl mx-auto px-4 w-full">
              <div class="max-w-xl animate-fade-in">
                <h2 class="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
                  {{ slide.title }}
                </h2>
                <p v-if="slide.subtitle" class="text-base md:text-lg text-gray-200 mb-6">
                  {{ slide.subtitle }}
                </p>
                <NuxtLink
                  v-if="slide.link"
                  :to="slide.link"
                  class="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-accent/25 hover:shadow-accent/40"
                >
                  Khám phá ngay
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Slider Controls -->
        <button
          @click="prevSlide"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all opacity-0 hover:opacity-100"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          @click="nextSlide"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all opacity-0 hover:opacity-100"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Dots -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <button
            v-for="(slide, index) in sliders"
            :key="index"
            @click="goToSlide(index)"
            class="w-2.5 h-2.5 rounded-full transition-all duration-300"
            :class="index === currentSlide ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'"
          ></button>
        </div>
      </div>
    </section>

    <!-- Static Hero Fallback (when no sliders) -->
    <section v-else class="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 text-white">
      <div class="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div class="absolute top-20 right-20 w-72 h-72 bg-primary-500 rounded-full blur-3xl opacity-20"></div>
      <div class="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
      <div class="max-w-7xl mx-auto px-4 py-20 md:py-32 relative z-10">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-blue-200 mb-6">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Miễn phí vận chuyển toàn quốc
          </div>
          <h1 class="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            ShopGiaDung
          </h1>
          <p class="text-lg md:text-xl text-blue-200 mb-8 leading-relaxed">
            Hệ thống bán hàng gia dụng hàng đầu Việt Nam. Sản phẩm chính hãng, giá tốt nhất thị trường.
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <NuxtLink
              to="/products"
              class="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-accent/25 hover:shadow-accent/40"
            >
              Mua sắm ngay
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </NuxtLink>
            <NuxtLink
              to="/products"
              class="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/20"
            >
              Xem sản phẩm
            </NuxtLink>
          </div>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
    </section>

    <!-- Service Strip -->
    <section class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="flex items-center gap-4 p-4 rounded-xl bg-primary-50">
            <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900">Miễn phí vận chuyển</h4>
              <p class="text-xs text-gray-500">Cho đơn từ 500.000đ</p>
            </div>
          </div>
          <div class="flex items-center gap-4 p-4 rounded-xl bg-emerald-50">
            <div class="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900">Hàng chính hãng</h4>
              <p class="text-xs text-gray-500">Cam kết 100%</p>
            </div>
          </div>
          <div class="flex items-center gap-4 p-4 rounded-xl bg-purple-50">
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900">Hỗ trợ 24/7</h4>
              <p class="text-xs text-gray-500">Hotline: 1900 1234 56</p>
            </div>
          </div>
          <div class="flex items-center gap-4 p-4 rounded-xl bg-amber-50">
            <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900">Giao hàng nhanh</h4>
              <p class="text-xs text-gray-500">Trong 2-4 ngày</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="max-w-7xl mx-auto px-4 py-8">
      <!-- Loading -->
      <div v-if="loading" class="space-y-8">
        <div v-for="i in 3" :key="i" class="space-y-4">
          <div class="h-7 w-48 skeleton"></div>
          <div class="product-grid">
            <ProductCardSkeleton v-for="j in 5" :key="j" />
          </div>
        </div>
      </div>

      <div v-else>
        <!-- Featured Products -->
        <section v-if="featuredProducts.length > 0" class="mb-8">
          <div class="flex items-center justify-between mb-5">
            <h2 class="section-title">Sản phẩm nổi bật</h2>
            <NuxtLink
              to="/products"
              class="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Xem thêm
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
          <div class="product-grid">
            <ProductCard
              v-for="product in featuredProducts.slice(0, 5)"
              :key="product.id"
              :product="product"
            />
          </div>
        </section>

        <!-- Products by Category -->
        <div v-if="groupedSections.length > 0">
          <ProductSection
            v-for="(section, index) in groupedSections"
            :key="index"
            :title="section.title"
            :products="section.products"
            :category-id="section.categoryId"
          />
        </div>

        <!-- Empty -->
        <div v-else class="flex flex-col items-center justify-center py-20 text-center">
          <svg class="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 class="text-lg font-medium text-gray-600 mb-1">Không có sản phẩm</h3>
          <p v-if="keyword" class="text-sm text-gray-400">Không tìm thấy sản phẩm phù hợp với "{{ keyword }}"</p>
          <p v-else class="text-sm text-gray-400">Chưa có sản phẩm nào trong cửa hàng</p>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="bg-white py-12 border-t border-gray-100">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10">Tại sao chọn ShopGiaDung?</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Bảo hành chính hãng</h3>
            <p class="text-sm text-gray-500 leading-relaxed">Tất cả sản phẩm đều được bảo hành chính hãng từ 12-24 tháng theo tiêu chuẩn nhà sản xuất.</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Giao hàng siêu tốc</h3>
            <p class="text-sm text-gray-500 leading-relaxed">Giao hàng trong 2-4 giờ tại nội thành. Miễn phí vận chuyển cho đơn hàng trên 500.000đ.</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Đổi trả 30 ngày</h3>
            <p class="text-sm text-gray-500 leading-relaxed">Đổi trả miễn phí trong vòng 30 ngày nếu sản phẩm lỗi hoặc không đúng mô tả.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
