<script setup>
import { computed } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const totalProducts = computed(() => {
  return props.categories.reduce((sum, cat) => sum + (cat._count?.products || cat.productCount || cat.product_count || 0), 0)
})

function selectCategory(categoryId) {
  emit('update:modelValue', categoryId)
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-100">
      <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        Danh mục
      </h3>
    </div>

    <!-- Category List -->
    <div class="p-2">
      <!-- All Products -->
      <button
        @click="selectCategory(null)"
        class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150"
        :class="[
          modelValue === null
            ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
        ]"
      >
        <span class="flex items-center gap-2.5">
          <span class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
          Tất cả sản phẩm
        </span>
        <span
          class="text-xs px-2 py-0.5 rounded-full"
          :class="[
            modelValue === null
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-500'
          ]"
        >
          {{ totalProducts }}
        </span>
      </button>

      <!-- Category Items -->
      <button
        v-for="category in categories"
        :key="category.id"
        @click="selectCategory(category.id)"
        class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 mt-0.5"
        :class="[
          modelValue === category.id
            ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
        ]"
      >
        <span class="flex items-center gap-2.5">
          <img
            v-if="category.icon || category.thumbnail"
            :src="category.icon || category.thumbnail"
            :alt="category.name"
            class="w-5 h-5 rounded object-cover flex-shrink-0"
          />
          <span
            v-else
            class="w-2 h-2 rounded-full flex-shrink-0"
            :class="modelValue === category.id ? 'bg-blue-500' : 'bg-gray-300'"
          ></span>
          <span class="truncate">{{ category.name }}</span>
        </span>
        <span
          class="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
          :class="[
            modelValue === category.id
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-500'
          ]"
        >
          {{ category._count?.products || category.productCount || category.product_count || 0 }}
        </span>
      </button>
    </div>
  </div>
</template>
