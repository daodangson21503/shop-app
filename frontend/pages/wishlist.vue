<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useWishlistStore } from '~/stores/wishlist'

definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const wishlistStore = useWishlistStore()
const router = useRouter()

const loading = ref(true)

const items = computed(() => wishlistStore.items)
const isEmpty = computed(() => items.value.length === 0)

async function fetchWishlist() {
  loading.value = true
  try {
    await wishlistStore.fetch()
  } catch {
    wishlistStore.items = []
  } finally {
    loading.value = false
  }
}

async function removeFromWishlist(productId) {
  const product = items.value.find((i) => i.productId === productId || i.product?.id === productId)
  if (product) {
    await wishlistStore.toggle(product.product || { id: productId })
  }
}

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  fetchWishlist()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <NuxtLink to="/" class="hover:text-blue-600">Trang chủ</NuxtLink>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-gray-900 font-medium">Danh sách yêu thích</span>
    </nav>

    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Danh sách yêu thích</h1>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-sm text-gray-500">Đang tải danh sách...</p>
    </div>

    <!-- Product Grid -->
    <div v-else-if="!isEmpty" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <div v-for="item in items" :key="item.id || item.productId" class="relative group">
        <ProductCard :product="item.product || item" />
        <button
          @click="removeFromWishlist(item.productId || item.product?.id)"
          class="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 z-10"
        >
          <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="flex flex-col items-center justify-center py-20 text-center">
      <svg class="w-24 h-24 text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <h3 class="text-xl font-medium text-gray-600 mb-2">Danh sách yêu thích trống</h3>
      <p class="text-sm text-gray-400 mb-6">Bạn chưa thêm sản phẩm yêu thích nào</p>
      <NuxtLink
        to="/products"
        class="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
      >
        Khám phá sản phẩm
      </NuxtLink>
    </div>
  </div>
</template>
