<script setup>
import { computed } from 'vue'
import { useCartStore } from '~/stores/cart'

definePageMeta({ layout: 'default' })

const cartStore = useCartStore()
const router = useRouter()

const items = computed(() => cartStore.items)
const isEmpty = computed(() => items.value.length === 0)
const grandTotal = computed(() => cartStore.total)

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

function updateQty(id, qty) {
  cartStore.updateQuantity(id, qty)
}

function removeItem(id) {
  cartStore.removeItem(id)
}

function goToCheckout() {
  router.push('/checkout')
}

function goToProducts() {
  router.push('/products')
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <NuxtLink to="/" class="hover:text-blue-600 transition-colors">Trang chủ</NuxtLink>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-gray-900 font-medium">Giỏ hàng</span>
    </nav>

    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Giỏ hàng</h1>

    <!-- Empty -->
    <div v-if="isEmpty" class="flex flex-col items-center justify-center py-20 text-center">
      <svg class="w-24 h-24 text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
      <h3 class="text-xl font-medium text-gray-600 mb-2">Giỏ hàng trống</h3>
      <p class="text-sm text-gray-400 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
      <button
        @click="goToProducts"
        class="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
      >
        Mua sắm ngay
      </button>
    </div>

    <!-- Cart Items -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Items List -->
      <div class="lg:col-span-2 space-y-4">
        <div
          v-for="item in items"
          :key="item.id"
          class="bg-white rounded-xl border border-gray-100 p-4 flex gap-4"
        >
          <!-- Image -->
          <div class="w-24 h-24 rounded-lg overflow-hidden bg-[#f5f5f5] flex-shrink-0">
            <img
              :src="item.imageUrl || '/placeholder-product.png'"
              :alt="item.name"
              class="w-full h-full object-contain p-1"
            />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <NuxtLink
              :to="`/products/${item.slug}`"
              class="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-1"
            >
              {{ item.name }}
            </NuxtLink>
            <p class="text-sm font-bold text-red-600 mb-2">{{ formatPrice(item.price) }}</p>

            <div class="flex items-center justify-between">
              <!-- Quantity -->
              <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  @click="updateQty(item.id, item.quantity - 1)"
                  class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                <input
                  :value="item.quantity"
                  type="number"
                  min="1"
                  @input="updateQty(item.id, parseInt($event.target.value) || 1)"
                  class="w-12 h-8 text-center text-xs font-medium border-x border-gray-300 focus:outline-none"
                />
                <button
                  @click="updateQty(item.id, item.quantity + 1)"
                  class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <div class="flex items-center gap-4">
                <span class="text-sm font-bold text-gray-900">{{ formatPrice(item.price * item.quantity) }}</span>
                <button
                  @click="removeItem(item.id)"
                  class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

      <!-- Summary -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Tổng giỏ hàng</h3>

          <div class="space-y-3 text-sm mb-4">
            <div class="flex justify-between">
              <span class="text-gray-500">Tạm tính</span>
              <span class="text-gray-900 font-medium">{{ formatPrice(grandTotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Phí vận chuyển</span>
              <span class="text-green-600 font-medium">Miễn phí</span>
            </div>
            <div class="border-t border-gray-100 pt-3 flex justify-between">
              <span class="text-base font-bold text-gray-900">Tổng cộng</span>
              <span class="text-lg font-bold text-red-600">{{ formatPrice(grandTotal) }}</span>
            </div>
          </div>

          <button
            @click="goToCheckout"
            class="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            Thanh toán
          </button>

          <NuxtLink
            to="/products"
            class="block text-center mt-3 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            Tiếp tục mua sắm
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
