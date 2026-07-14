<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({ layout: 'default' })

const page = ref(null)
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  try {
    const api = useApi()
    const res = await api('/pages/policy')
    page.value = res.data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page-container">
    <nav class="breadcrumb">
      <NuxtLink to="/">Trang chủ</NuxtLink>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-gray-900 font-medium">Chính sách</span>
    </nav>

    <div v-if="loading" class="space-y-4">
      <div class="h-10 w-64 skeleton"></div>
      <div class="h-4 w-full skeleton"></div>
      <div class="h-4 w-3/4 skeleton"></div>
    </div>

    <div v-else-if="error" class="text-center py-20">
      <h2 class="text-xl font-bold text-gray-600 mb-2">Không tìm thấy trang</h2>
      <p class="text-gray-400">Trang này hiện chưa có nội dung.</p>
    </div>

    <article v-else-if="page" class="max-w-4xl mx-auto">
      <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">{{ page.title }}</h1>
      <div class="prose prose-gray max-w-none" v-html="page.content"></div>
    </article>
  </div>
</template>
