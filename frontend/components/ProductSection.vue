<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  products: {
    type: Array,
    default: () => [],
  },
  categoryId: {
    type: Number,
    default: null,
  },
})

const router = useRouter()
const scrollContainer = ref(null)

const hasProducts = computed(() => props.products.length > 0)

function viewAll() {
  if (props.categoryId) {
    router.push({ path: '/products', query: { category: props.categoryId } })
  } else {
    router.push('/products')
  }
}

function scrollLeft() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: -300, behavior: 'smooth' })
  }
}

function scrollRight() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: 300, behavior: 'smooth' })
  }
}
</script>

<template>
  <section class="py-6">
    <!-- Section Header -->
    <div class="flex items-center justify-between mb-5">
      <h2 class="section-title">{{ title }}</h2>
      <div class="flex items-center gap-3">
        <div class="hidden md:flex items-center gap-1">
          <button
            @click="scrollLeft"
            class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            @click="scrollRight"
            class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <NuxtLink
          :to="categoryId ? { path: '/products', query: { category: categoryId } } : '/products'"
          class="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap"
        >
          Xem thêm
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>
    </div>

    <!-- Products Scroll Container -->
    <div v-if="hasProducts" class="relative">
      <div class="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 hidden md:block"></div>
      <div class="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 hidden md:block"></div>

      <div
        ref="scrollContainer"
        class="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
        style="scrollbar-width: none; -ms-overflow-style: none;"
      >
        <div
          v-for="product in products"
          :key="product.id"
          class="flex-shrink-0 w-[180px] md:w-[220px]"
        >
          <ProductCard :product="product" />
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-12 text-center">
      <svg class="w-16 h-16 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <p class="text-sm text-gray-400">Không có sản phẩm nào</p>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
