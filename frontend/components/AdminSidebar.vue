<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const user = computed(() => authStore.user)

const navItems = [
  {
    label: 'Tổng quan',
    to: '/admin',
    icon: 'dashboard',
    exact: true,
  },
  {
    label: 'Sản phẩm',
    to: '/admin/products',
    icon: 'products',
  },
  {
    label: 'Danh mục',
    to: '/admin/categories',
    icon: 'categories',
  },
  {
    label: 'Đơn hàng',
    to: '/admin/orders',
    icon: 'orders',
  },
  {
    label: 'Voucher',
    to: '/admin/vouchers',
    icon: 'vouchers',
  },
  {
    label: 'Người dùng',
    to: '/admin/users',
    icon: 'users',
  },
]

function isActive(item) {
  if (item.exact) {
    return route.path === item.to
  }
  return route.path.startsWith(item.to)
}

function handleLogout() {
  authStore.logout()
  router.push('/admin/login')
}
</script>

<template>
  <aside class="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 shadow-lg">
    <div class="flex flex-col h-full">
      <!-- Logo -->
      <div class="flex items-center justify-center h-16 border-b border-gray-100">
        <NuxtLink to="/admin" class="text-xl font-bold text-blue-900 hover:text-blue-700 transition-colors">
          🏠 ShopGiaDung
        </NuxtLink>
      </div>

      <!-- Admin Badge -->
      <div class="px-4 py-3 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 uppercase tracking-wide">
            Admin
          </span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
          :class="[
            isActive(item)
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
          ]"
        >
          <!-- Dashboard Icon -->
          <svg v-if="item.icon === 'dashboard'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>

          <!-- Products Icon -->
          <svg v-else-if="item.icon === 'products'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>

          <!-- Categories Icon -->
          <svg v-else-if="item.icon === 'categories'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>

          <!-- Orders Icon -->
          <svg v-else-if="item.icon === 'orders'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>

          <!-- Vouchers Icon -->
          <svg v-else-if="item.icon === 'vouchers'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>

          <!-- Users Icon -->
          <svg v-else-if="item.icon === 'users'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>

          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- User Info & Logout -->
      <div class="border-t border-gray-100 p-3">
        <div class="flex items-center gap-3 px-3 py-2">
          <div class="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ user?.name || 'Admin' }}</p>
            <p class="text-xs text-gray-500 truncate">{{ user?.email || 'admin@shopgiadung.vn' }}</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-2 mt-1 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  </aside>
</template>
