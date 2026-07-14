<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'blank' })

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const googleLoading = ref(false)

async function handleLogin() {
  error.value = ''
  if (!email.value.trim()) { error.value = 'Vui lòng nhập email'; return }
  if (!password.value) { error.value = 'Vui lòng nhập mật khẩu'; return }

  loading.value = true
  try {
    await authStore.login(email.value.trim(), password.value)
    if (!authStore.isAdmin) {
      authStore.logout()
      error.value = 'Bạn không có quyền truy cập trang quản trị'
      return
    }
    router.push('/admin')
  } catch (e) {
    error.value = e?.data?.message || e?.message || 'Email hoặc mật khẩu không đúng'
  } finally {
    loading.value = false
  }
}

async function handleGoogleLogin(credential) {
  googleLoading.value = true
  try {
    await authStore.googleLogin(credential)
    if (!authStore.isAdmin) {
      authStore.logout()
      error.value = 'Bạn không có quyền truy cập trang quản trị'
      return
    }
    router.push('/admin')
  } catch (e) {
    error.value = e?.data?.message || e?.message || 'Đăng nhập Google thất bại'
  } finally {
    googleLoading.value = false
  }
}

const { initGoogleLogin, isAvailable } = useGoogleLogin()

onMounted(() => {
  if (isAvailable) {
    nextTick(() => initGoogleLogin(handleGoogleLogin))
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="text-3xl mb-2">🏠</div>
          <h1 class="text-xl font-bold text-gray-900">ShopGiaDung</h1>
          <p class="text-sm text-gray-500 mt-1">Đăng nhập quản trị</p>
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
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="admin@shopgiadung.vn"
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

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <div v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>
        </form>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-6">
          <div class="flex-1 border-t border-gray-200"></div>
          <span class="text-sm text-gray-400">Hoặc</span>
          <div class="flex-1 border-t border-gray-200"></div>
        </div>

        <!-- Google Sign In -->
        <div v-if="googleLoading" class="flex justify-center py-3">
          <div class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div id="google-signin-btn" class="flex justify-center"></div>

        <NuxtLink
          to="/"
          class="block text-center mt-6 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          ← Về trang chủ
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
