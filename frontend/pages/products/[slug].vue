<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '~/stores/cart'
import { useWishlistStore } from '~/stores/wishlist'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const authStore = useAuthStore()

const product = ref(null)
const relatedProducts = ref([])
const reviews = ref([])
const loading = ref(true)
const quantity = ref(1)
const addingToCart = ref(false)
const activeImage = ref(0)
const reviewForm = ref({ rating: 5, content: '', name: '', phone: '', email: '' })
const submittingReview = ref(false)
const activeTab = ref(0)

const tabs = computed(() => [
  { id: 0, label: 'Mô tả sản phẩm', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 1, label: 'Thông số kỹ thuật', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  { id: 2, label: `Đánh giá (${reviews.value.length})`, icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
])

const specifications = computed(() => {
  if (!product.value) return []
  const specs = []
  if (product.value.brand) specs.push({ label: 'Thương hiệu', value: product.value.brand })
  if (product.value.warranty) specs.push({ label: 'Bảo hành', value: product.value.warranty })
  if (product.value.weight) specs.push({ label: 'Trọng lượng', value: `${product.value.weight} kg` })
  if (product.value.unit) specs.push({ label: 'Đơn vị tính', value: product.value.unit })
  if (product.value.sku) specs.push({ label: 'Mã sản phẩm', value: product.value.sku })
  if (product.value.categoryName) specs.push({ label: 'Danh mục', value: product.value.categoryName })
  if (product.value.attributes?.length) {
    product.value.attributes.forEach(attr => {
      specs.push({ label: attr.name, value: attr.value })
    })
  }
  return specs
})

const formattedPrice = computed(() => {
  if (!product.value) return ''
  return new Intl.NumberFormat('vi-VN').format(product.value.price) + 'đ'
})

const formattedOriginalPrice = computed(() => {
  if (!product.value?.originalPrice) return null
  return new Intl.NumberFormat('vi-VN').format(product.value.originalPrice) + 'đ'
})

const discountPercentage = computed(() => {
  if (!product.value?.originalPrice || product.value.originalPrice <= product.value.price) return 0
  return Math.round(((product.value.originalPrice - product.value.price) / product.value.originalPrice) * 100)
})

const ratingStars = computed(() => {
  const rating = product.value?.avgRating || product.value?.rating || 0
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars.push('full')
    else if (i - rating < 1 && i - rating > 0) stars.push('half')
    else stars.push('empty')
  }
  return stars
})

const avgRatingPercent = computed(() => {
  const rating = product.value?.avgRating || product.value?.rating || 0
  return (rating / 5) * 100
})

const productImages = computed(() => {
  if (!product.value) return []
  if (product.value.images?.length) return product.value.images.map(i => i.url || i)
  if (product.value.imageUrl) return [product.value.imageUrl]
  return ['/placeholder-product.png']
})

const isWishlisted = computed(() => {
  return wishlistStore.isWishlisted?.(product.value?.id) || false
})

const inStock = computed(() => {
  return !product.value?.stock || product.value.stock > 0
})

async function fetchProduct() {
  loading.value = true
  try {
    const api = useApi()
    const res = await api(`/products/${route.params.slug}`)
    product.value = res.data
    quantity.value = 1
    activeImage.value = 0

    if (product.value?.categoryId || product.value?.category_id) {
      const catId = product.value.categoryId || product.value.category_id
      const relRes = await api('/products', {
        params: { category: catId, limit: 6 },
      })
      const relList = relRes.data?.products || relRes.data?.data || relRes.data || []
      relatedProducts.value = relList.filter((p) => p.id !== product.value.id).slice(0, 5)
    }

    const revRes = await api(`/reviews/product/${product.value.id}`)
    reviews.value = revRes.data?.reviews || []
  } catch {
    product.value = null
  } finally {
    loading.value = false
  }
}

function decreaseQty() {
  if (quantity.value > 1) quantity.value--
}

function increaseQty() {
  if (product.value?.stock && quantity.value < product.value.stock) quantity.value++
  else quantity.value++
}

function addToCart() {
  if (!product.value) return
  addingToCart.value = true
  cartStore.addItem(product.value, quantity.value)
  setTimeout(() => { addingToCart.value = false }, 600)
}

function buyNow() {
  if (!product.value) return
  cartStore.addItem(product.value, quantity.value)
  router.push('/cart')
}

async function toggleWishlist() {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  try {
    await wishlistStore.toggle(product.value)
  } catch {}
}

async function submitReview() {
  if (!authStore.isLoggedIn) { router.push('/login'); return }
  if (!reviewForm.value.content.trim()) return
  submittingReview.value = true
  try {
    const api = useApi()
    await api('/reviews', {
      method: 'POST',
      body: {
        product_id: product.value.id,
        rating: reviewForm.value.rating,
        comment: reviewForm.value.content,
      },
    })
    reviewForm.value.content = ''
    const revRes = await api(`/reviews/product/${product.value.id}`)
    reviews.value = revRes.data?.reviews || []
  } catch {}
  submittingReview.value = false
}

onMounted(fetchProduct)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <NuxtLink to="/" class="hover:text-blue-600 transition-colors">Trang chủ</NuxtLink>
      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <NuxtLink to="/products" class="hover:text-blue-600 transition-colors">Sản phẩm</NuxtLink>
      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-gray-900 font-medium truncate">{{ product?.name || '...' }}</span>
    </nav>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-sm text-gray-500">Đang tải thông tin sản phẩm...</p>
    </div>

    <!-- Not Found -->
    <div v-else-if="!product" class="flex flex-col items-center justify-center py-20 text-center">
      <svg class="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-600 mb-1">Sản phẩm không tồn tại</h3>
      <p class="text-sm text-gray-400 mb-4">Sản phẩm này có thể đã bị xóa hoặc không tồn tại</p>
      <NuxtLink to="/products" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
        Quay lại cửa hàng
      </NuxtLink>
    </div>

    <!-- Product Detail -->
    <div v-else>
      <!-- Top Row: Image + Info + Sidebar -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-10">
        <!-- Left: Image Gallery -->
        <div class="lg:col-span-5">
            <div class="relative">
              <div class="aspect-square rounded-xl overflow-hidden bg-[#f5f5f5]">
                <img
                  :src="productImages[activeImage]"
                  :alt="product.name"
                  class="w-full h-full object-contain p-4"
                />
              </div>
            <div
              v-if="discountPercentage > 0"
              class="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-lg shadow-sm"
            >
              -{{ discountPercentage }}%
            </div>
          </div>
          <!-- Thumbnails -->
          <div v-if="productImages.length > 1" class="flex gap-2 mt-3">
            <button
              v-for="(img, idx) in productImages"
              :key="idx"
              @click="activeImage = idx"
              class="w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors bg-[#f5f5f5]"
              :class="activeImage === idx ? 'border-blue-500' : 'border-transparent hover:border-gray-300'"
            >
              <img :src="img" :alt="`${product.name} ${idx + 1}`" class="w-full h-full object-contain p-1" />
            </button>
          </div>
        </div>

        <!-- Middle: Product Info -->
        <div class="lg:col-span-4">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">{{ product.name }}</h1>

            <!-- Rating -->
            <div class="flex items-center gap-3 mb-4">
              <div class="flex items-center gap-0.5">
                <template v-for="(star, index) in ratingStars" :key="index">
                  <svg
                    v-if="star === 'full'" class="w-5 h-5 text-amber-400 fill-amber-400" viewBox="0 0 24 24"
                  ><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  <svg
                    v-else-if="star === 'half'" class="w-5 h-5 text-amber-400" viewBox="0 0 24 24"
                  ><defs><linearGradient id="half"><stop offset="50%" stop-color="currentColor" /><stop offset="50%" stop-color="transparent" /></linearGradient></defs><path fill="url(#half)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="1" /></svg>
                  <svg
                    v-else class="w-5 h-5 text-gray-200 fill-gray-200" viewBox="0 0 24 24"
                  ><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                </template>
              </div>
              <span class="text-sm text-gray-500">({{ product.reviewCount || product.totalReviews || 0 }} đánh giá)</span>
            </div>

            <!-- Price -->
            <div class="flex items-baseline gap-3 mb-6">
              <span class="text-3xl font-bold text-red-600">{{ formattedPrice }}</span>
              <span
                v-if="formattedOriginalPrice"
                class="text-lg text-gray-400 line-through"
              >{{ formattedOriginalPrice }}</span>
            </div>

            <!-- Dynamic Product Attributes from API -->
            <div v-if="product.attributes?.length" class="border-t border-gray-100 pt-5 mb-3 space-y-2.5">
              <div v-for="attr in product.attributes" :key="attr.id" class="flex items-start gap-2 text-sm">
                <span class="text-gray-500 min-w-[100px] flex-shrink-0">{{ attr.name }}:</span>
                <span class="text-gray-800 font-medium">{{ attr.value }}</span>
              </div>
            </div>

            <!-- Product Attributes -->
            <div class="border-t border-gray-100 pt-5 mb-6 space-y-2.5">
              <div class="flex items-start gap-2 text-sm">
                <span class="text-gray-500 min-w-[100px] flex-shrink-0">Danh mục:</span>
                <span class="text-gray-800 font-medium">{{ product.categoryName || '---' }}</span>
              </div>
              <div class="flex items-start gap-2 text-sm">
                <span class="text-gray-500 min-w-[100px] flex-shrink-0">Tình trạng:</span>
                <span
                  class="inline-flex items-center gap-1 font-medium"
                  :class="inStock ? 'text-green-600' : 'text-red-500'"
                >
                  <span class="w-2 h-2 rounded-full" :class="inStock ? 'bg-green-500' : 'bg-red-500'"></span>
                  {{ inStock ? 'Còn hàng' : 'Hết hàng' }}
                </span>
              </div>
              <div class="flex items-start gap-2 text-sm">
                <span class="text-gray-500 min-w-[100px] flex-shrink-0">Đã bán:</span>
                <span class="text-gray-800 font-medium">{{ product.soldCount || product.sold || 0 }}</span>
              </div>
              <div class="flex items-start gap-2 text-sm">
                <span class="text-gray-500 min-w-[100px] flex-shrink-0">Mã SP:</span>
                <span class="text-gray-800 font-medium">{{ product.sku || product.id || '---' }}</span>
              </div>
            </div>

            <!-- Short Description -->
            <p v-if="product.shortDescription || product.description" class="text-gray-600 text-sm leading-relaxed mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
              {{ product.shortDescription || (product.description ? product.description.substring(0, 200) + '...' : '') }}
            </p>

            <!-- Quantity -->
            <div class="flex items-center gap-4 mb-6">
              <span class="text-sm font-medium text-gray-700">Số lượng:</span>
              <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  @click="decreaseQty"
                  class="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                <input
                  v-model="quantity"
                  type="number"
                  min="1"
                  class="w-16 h-10 text-center text-sm font-medium border-x border-gray-300 focus:outline-none"
                />
                <button
                  @click="increaseQty"
                  class="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                @click="addToCart"
                class="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {{ addingToCart ? 'Đã thêm!' : 'Thêm vào giỏ' }}
              </button>
              <button
                @click="buyNow"
                class="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Mua ngay
              </button>
              <button
                @click="toggleWishlist"
                class="px-4 py-3.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                :class="{ 'border-red-200 bg-red-50': isWishlisted }"
              >
                <svg
                  class="w-5 h-5"
                  :class="isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    :stroke-width="isWishlisted ? 0 : 2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>

            <!-- Shipping / Policy Info -->
            <div class="border border-gray-200 rounded-xl divide-y divide-gray-100">
              <div class="flex items-center gap-3 px-4 py-3">
                <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-sm text-gray-600">Miễn phí vận chuyển cho đơn từ 500.000đ</span>
              </div>
              <div class="flex items-center gap-3 px-4 py-3">
                <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-sm text-gray-600">Hàng chính hãng 100%, bảo hành 12 tháng</span>
              </div>
              <div class="flex items-center gap-3 px-4 py-3">
                <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-sm text-gray-600">Đổi trả trong 30 ngày nếu lỗi</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Contact Sidebar -->
        <div class="lg:col-span-3 space-y-4">
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h3 class="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Mua hàng ngay
            </h3>
            <p class="text-xs text-gray-500 mb-3">Gọi ngay để được tư vấn và đặt hàng nhanh nhất</p>
            <a href="tel:1900123456" class="block text-center py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Gọi 1900 1234 56
            </a>
          </div>

          <div class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-5">
            <h3 class="text-sm font-bold text-gray-900 mb-3">Cam kết</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800">Chất lượng</p>
                  <p class="text-xs text-gray-500">Cam kết uy tín</p>
                </div>
              </div>
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800">Tiện lợi</p>
                  <p class="text-xs text-gray-500">Thanh toán và giao hàng nhanh</p>
                </div>
              </div>
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800">Đổi trả</p>
                  <p class="text-xs text-gray-500">Chính sách đổi trả rõ ràng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs: Description / Specifications / Reviews -->
      <div class="mb-12">
        <!-- Tab Headers -->
        <div class="flex border-b border-gray-200 mb-6 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap"
            :class="activeTab === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
            </svg>
            {{ tab.label }}
            <span
              v-if="tab.id === 2 && reviews.length > 0"
              class="ml-1 px-1.5 py-0.5 text-xs rounded-full"
              :class="activeTab === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'"
            >{{ reviews.length }}</span>
          </button>
        </div>

        <!-- Tab: Description -->
        <div v-if="activeTab === 0" class="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
          <div
            v-if="product.description"
            class="product-description text-gray-700 leading-relaxed"
            v-html="product.description"
          ></div>
          <div v-else class="text-center py-12">
            <svg class="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-sm text-gray-400">Chưa có mô tả cho sản phẩm này.</p>
          </div>
        </div>

        <!-- Tab: Specifications -->
        <div v-if="activeTab === 1" class="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
          <div v-if="specifications.length > 0" class="overflow-hidden rounded-xl border border-gray-200">
            <table class="w-full text-sm">
              <tbody>
                <tr
                  v-for="(spec, idx) in specifications"
                  :key="idx"
                  class="border-b border-gray-100 last:border-0"
                  :class="idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'"
                >
                  <td class="px-5 py-3.5 text-gray-500 font-medium w-[180px] min-w-[140px]">{{ spec.label }}</td>
                  <td class="px-5 py-3.5 text-gray-900">{{ spec.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-12">
            <svg class="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            <p class="text-sm text-gray-400">Chưa có thông số kỹ thuật.</p>
          </div>
        </div>

        <!-- Tab: Reviews -->
        <div v-if="activeTab === 2">
          <!-- Review Form -->
          <div v-if="authStore.isLoggedIn" class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 class="text-sm font-medium text-gray-900 mb-3">Viết đánh giá của bạn</h3>
            <div class="flex items-center gap-2 mb-3">
              <span class="text-sm text-gray-500">Đánh giá:</span>
              <div class="flex items-center gap-0.5">
                <button v-for="i in 5" :key="i" @click="reviewForm.rating = i" type="button">
                  <svg
                    class="w-5 h-5 transition-colors"
                    :class="i <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'"
                    viewBox="0 0 24 24"
                  ><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                </button>
              </div>
            </div>
            <textarea
              v-model="reviewForm.content"
              rows="3"
              placeholder="Chia sẻ nhận xét của bạn về sản phẩm..."
              class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            ></textarea>
            <button
              @click="submitReview"
              :disabled="!reviewForm.content.trim() || submittingReview"
              class="mt-3 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {{ submittingReview ? 'Đang gửi...' : 'Gửi đánh giá' }}
            </button>
          </div>
          <div v-else class="bg-white rounded-xl border border-gray-200 p-6 mb-6 text-center">
            <p class="text-sm text-gray-500">
              <NuxtLink to="/login" class="text-blue-600 hover:underline">Đăng nhập</NuxtLink> để viết đánh giá
            </p>
          </div>

          <!-- Review List -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Tất cả đánh giá ({{ reviews.length }})
            </h3>
            <div v-if="reviews.length === 0" class="text-center py-8">
              <p class="text-sm text-gray-400">Chưa có đánh giá nào cho sản phẩm này.</p>
            </div>
            <div v-else class="space-y-5">
              <div
                v-for="review in reviews"
                :key="review.id"
                class="border-b border-gray-100 last:border-0 pb-5 last:pb-0"
              >
                <div class="flex items-start gap-3 mb-2">
                  <div class="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 flex-shrink-0">
                    {{ (review.user?.fullName || '?')[0] }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                      <p class="text-sm font-medium text-gray-900">{{ review.user?.fullName }}</p>
                      <span class="text-xs text-gray-400">{{ review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : '' }}</span>
                    </div>
                    <div class="flex items-center gap-1 mt-0.5">
                      <svg
                        v-for="i in 5" :key="i"
                        class="w-3.5 h-3.5"
                        :class="i <= (review.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'"
                        viewBox="0 0 24 24"
                      ><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    </div>
                  </div>
                </div>
                <p class="text-sm text-gray-600 ml-12">{{ review.content || review.comment }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div v-if="relatedProducts.length > 0">
        <ProductSection title="Sản phẩm liên quan" :products="relatedProducts" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-description {
  font-size: 0.9375rem;
  line-height: 1.75;
}
.product-description h1,
.product-description h2,
.product-description h3,
.product-description h4 {
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  color: #111827;
}
.product-description h1 { font-size: 1.5rem; }
.product-description h2 { font-size: 1.25rem; }
.product-description h3 { font-size: 1.125rem; }
.product-description p {
  margin-bottom: 1em;
}
.product-description ul,
.product-description ol {
  padding-left: 1.5em;
  margin-bottom: 1em;
}
.product-description li {
  margin-bottom: 0.25em;
}
.product-description img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1.5em auto;
  display: block;
}
.product-description a {
  color: #2563eb;
  text-decoration: underline;
}
.product-description a:hover {
  color: #1d4ed8;
}
.product-description blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1em;
  color: #6b7280;
  margin: 1em 0;
  font-style: italic;
}
.product-description table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}
.product-description th,
.product-description td {
  border: 1px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
  text-align: left;
}
.product-description th {
  background-color: #f9fafb;
  font-weight: 600;
}
.product-description pre {
  background-color: #f3f4f6;
  padding: 1em;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-size: 0.875rem;
  margin: 1em 0;
}
.product-description code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
.product-description pre code {
  background: none;
  padding: 0;
}
</style>
