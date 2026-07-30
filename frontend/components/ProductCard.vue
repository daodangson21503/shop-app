<script setup>
import { computed } from 'vue'
import { useWishlistStore } from '~/stores/wishlist'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'
import { useToast } from '~/composables/useToast'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const wishlistStore = useWishlistStore()
const authStore = useAuthStore()
const cartStore = useCartStore()
const toast = useToast()

const isWishlisted = computed(() => {
  return wishlistStore.isWishlisted?.(props.product.id) || false
})

const discountPercentage = computed(() => {
  if (props.product.originalPrice && props.product.originalPrice > props.product.price) {
    return Math.round(((props.product.originalPrice - props.product.price) / props.product.originalPrice) * 100)
  }
  return 0
})

const ratingStars = computed(() => {
  const rating = props.product.avgRating || props.product.rating || 0
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push('full')
    } else if (i - rating < 1 && i - rating > 0) {
      stars.push('half')
    } else {
      stars.push('empty')
    }
  }
  return stars
})

const reviewCount = computed(() => {
  return props.product.reviewCount || props.product.totalReviews || 0
})

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('vi-VN').format(props.product.price) + 'đ'
})

const formattedOriginalPrice = computed(() => {
  if (props.product.originalPrice && props.product.originalPrice > props.product.price) {
    return new Intl.NumberFormat('vi-VN').format(props.product.originalPrice) + 'đ'
  }
  return null
})

const productImage = computed(() => {
  if (props.product.images?.length > 0) {
    return props.product.images[0].url || props.product.imageUrl
  }
  return props.product.imageUrl || '/placeholder-product.png'
})

function goToProduct() {
  router.push(`/products/${props.product.slug}`)
}

async function toggleWishlist(e) {
  e.stopPropagation()
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  const wasWishlisted = wishlistStore.isWishlisted(props.product.id)
  try {
    await wishlistStore.toggle(props.product)
    toast.success(wasWishlisted ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích')
  } catch (error) {
    toast.error('Thao tác thất bại')
  }
}

function addToCart(e) {
  e.stopPropagation()
  cartStore.addItem(props.product)
  toast.success('Đã thêm vào giỏ hàng')
}
</script>

<template>
    <div
      class="group relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      @click="goToProduct"
    >
      <!-- Image -->
      <div class="relative aspect-square overflow-hidden bg-[#f5f5f5]">
        <img
          :src="productImage"
          :alt="product.name"
          class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 p-2"
          loading="lazy"
        />

      <!-- Discount Badge -->
      <div
        v-if="discountPercentage > 0"
        class="discount-badge"
      >
        -{{ discountPercentage }}%
      </div>

      <!-- Featured Badge -->
      <div
        v-if="product.isFeatured"
        class="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold rounded-md shadow-sm"
      >
        Nổi bật
      </div>

      <!-- Wishlist Button -->
      <button
        @click="toggleWishlist"
        class="absolute top-2 right-2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:shadow-md"
        :class="{ '!opacity-100': isWishlisted }"
      >
        <svg
          class="w-5 h-5 transition-colors"
          :class="isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          :stroke-width="isWishlisted ? 0 : 2"
        >
          <path
            v-if="isWishlisted"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      <!-- Add to Cart Overlay -->
      <div class="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          @click="addToCart"
          class="w-full py-2 bg-white text-gray-800 text-xs font-semibold rounded-lg hover:bg-primary-50 transition-colors shadow-sm flex items-center justify-center gap-1.5"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          Thêm vào giỏ
        </button>
      </div>

      <!-- Sold Info -->
      <div class="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] rounded-md">
        Đã bán {{ product.soldCount || product.sold || 0 }}
      </div>
    </div>

    <!-- Info -->
    <div class="p-3">
      <!-- Category -->
      <p v-if="product.categoryName" class="text-[11px] text-gray-400 uppercase tracking-wide mb-1">
        {{ product.categoryName }}
      </p>

      <!-- Name -->
      <h3 class="text-sm font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors min-h-[40px]">
        {{ product.name }}
      </h3>

      <!-- Rating -->
      <div class="flex items-center gap-1.5 mb-2">
        <div class="flex items-center gap-0.5">
          <template v-for="(star, index) in ratingStars" :key="index">
            <svg
              v-if="star === 'full'"
              class="w-3.5 h-3.5 text-amber-400 fill-amber-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <svg
              v-else-if="star === 'half'"
              class="w-3.5 h-3.5 text-amber-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <defs>
                <linearGradient id="half-star">
                  <stop offset="50%" stop-color="currentColor" />
                  <stop offset="50%" stop-color="transparent" />
                </linearGradient>
              </defs>
              <path fill="url(#half-star)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="1" />
            </svg>
            <svg
              v-else
              class="w-3.5 h-3.5 text-gray-200 fill-gray-200"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </template>
        </div>
        <span v-if="reviewCount > 0" class="text-[11px] text-gray-400">({{ reviewCount }})</span>
      </div>

      <!-- Price -->
      <div class="flex items-baseline gap-2">
        <span class="text-base font-bold text-red-600">{{ formattedPrice }}</span>
        <span
          v-if="formattedOriginalPrice"
          class="text-xs text-gray-400 line-through"
        >
          {{ formattedOriginalPrice }}
        </span>
      </div>
    </div>
  </div>
</template>
