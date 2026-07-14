<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const router = useRouter()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''
  if (!fullName.value.trim()) { error.value = 'Vui lòng nhập họ tên'; return }
  if (!email.value.trim()) { error.value = 'Vui lòng nhập email'; return }
  if (!password.value) { error.value = 'Vui lòng nhập mật khẩu'; return }
  if (password.value.length < 6) { error.value = 'Mật khẩu phải có ít nhất 6 ký tự'; return }
  if (password.value !== confirmPassword.value) { error.value = 'Mật khẩu xác nhận không khớp'; return }

  loading.value = true
  try {
    const api = useApi()
    await api('/auth/register', {
      method: 'POST',
      body: {
        fullName: fullName.value.trim(),
        email: email.value.trim(),
        password: password.value,
      },
    })
    await authStore.login(email.value.trim(), password.value)
    router.push('/')
  } catch (e) {
    error.value = e?.data?.message || e?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <NuxtLink to="/" class="text-2xl font-bold text-blue-900">🏠 ShopGiaDung</NuxtLink>
          <h1 class="text-2xl font-bold text-gray-900 mt-6">Đăng ký</h1>
          <p class="text-sm text-gray-500 mt-1">Tạo tài khoản để mua sắm dễ dàng hơn</p>
        </div>

        <!-- Error -->
        <div
          v-if="error"
          class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4"
        >
          <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <input
              v-model="fullName"
              type="text"
              placeholder="Nguyễn Văn A"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="your@email.com"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="••••••••"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <div v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ loading ? 'Đang đăng ký...' : 'Đăng ký' }}
          </button>
        </form>

        <!-- Login Link -->
        <p class="text-center text-sm text-gray-500 mt-6">
          Đã có tài khoản?
          <NuxtLink to="/login" class="text-blue-600 hover:text-blue-700 font-medium">Đăng nhập</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
