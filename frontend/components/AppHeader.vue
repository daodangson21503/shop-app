<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const showUserDropdown = ref(false)
const showMobileMenu = ref(false)
const userDropdownRef = ref(null)

const isLoggedIn = computed(() => authStore.isLoggedIn)
const isAdmin = computed(() => authStore.isAdmin)
const user = computed(() => authStore.user)
const cartCount = computed(() => cartStore.count || 0)

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/products', query: { search: searchQuery.value.trim() } })
    searchQuery.value = ''
    showMobileMenu.value = false
  }
}

function handleLogout() {
  authStore.logout()
  showUserDropdown.value = false
  router.push('/')
}

function toggleUserDropdown() {
  showUserDropdown.value = !showUserDropdown.value
}

function handleClickOutside(e) {
  if (userDropdownRef.value && !userDropdownRef.value.contains(e.target)) {
    showUserDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="sticky top-0 z-50 w-full bg-white shadow-sm">
    <!-- Top Bar -->
    <div class="bg-blue-900 text-white text-xs">
      <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-8">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Hotline: 1900 1234 56
          </span>
          <span class="hidden sm:flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            support@shopgiadung.vn
          </span>
        </div>
        <div class="hidden md:flex items-center gap-3">
          <NuxtLink to="/help" class="hover:text-blue-200 transition-colors">Hỗ trợ</NuxtLink>
          <span class="text-blue-400">|</span>
          <NuxtLink to="/track-order" class="hover:text-blue-200 transition-colors">Theo dõi đơn hàng</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Main Header -->
    <div class="max-w-7xl mx-auto px-4 py-3">
      <div class="flex items-center gap-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex-shrink-0 text-xl md:text-2xl font-bold text-blue-900 whitespace-nowrap hover:text-blue-700 transition-colors">
          🏠 ShopGiaDung
        </NuxtLink>

        <!-- Search Bar (hidden on mobile) -->
        <div class="hidden md:flex flex-1 max-w-xl">
          <form @submit.prevent="handleSearch" class="flex w-full">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            />
            <button
              type="submit"
              class="px-5 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        <!-- Desktop Action Buttons -->
        <div class="hidden md:flex items-center gap-2">
          <!-- Logged in (not admin) -->
          <template v-if="isLoggedIn && !isAdmin">
            <div ref="userDropdownRef" class="relative">
              <button
                @click.stop="toggleUserDropdown"
                class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="max-w-[100px] truncate">{{ user?.name || 'Tài khoản' }}</span>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <Transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <div
                  v-if="showUserDropdown"
                  class="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                >
                  <div class="px-4 py-2 border-b border-gray-100">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ user?.name }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ user?.email }}</p>
                  </div>
                  <NuxtLink
                    to="/account"
                    @click="showUserDropdown = false"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Tài khoản
                  </NuxtLink>
                  <NuxtLink
                    to="/my-orders"
                    @click="showUserDropdown = false"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Đơn hàng của tôi
                  </NuxtLink>
                  <NuxtLink
                    to="/wishlist"
                    @click="showUserDropdown = false"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Danh sách yêu thích
                  </NuxtLink>
                  <div class="border-t border-gray-100 mt-1 pt-1">
                    <button
                      @click="handleLogout"
                      class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </template>

          <!-- Not logged in -->
          <template v-else-if="!isLoggedIn">
            <NuxtLink
              to="/login"
              class="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Đăng nhập
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Đăng ký
            </NuxtLink>
          </template>

          <!-- Notifications -->
          <div v-if="isLoggedIn">
            <NotificationBell />
          </div>

          <!-- Cart -->
          <NuxtLink to="/cart" class="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ml-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <span
              v-if="cartCount > 0"
              class="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full"
            >
              {{ cartCount > 99 ? '99+' : cartCount }}
            </span>
          </NuxtLink>
        </div>

        <!-- Mobile Cart -->
        <NuxtLink to="/cart" class="relative md:hidden p-2 text-gray-600 hover:text-blue-600 rounded-lg transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <span
            v-if="cartCount > 0"
            class="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full"
          >
            {{ cartCount > 99 ? '99+' : cartCount }}
          </span>
        </NuxtLink>

        <!-- Mobile Hamburger -->
        <button
          @click="showMobileMenu = !showMobileMenu"
          class="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg v-if="!showMobileMenu" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile Search -->
      <form @submit.prevent="handleSearch" class="mt-3 md:hidden flex">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
        />
        <button
          type="submit"
          class="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="showMobileMenu" class="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
        <template v-if="isLoggedIn && !isAdmin">
          <div class="pb-2 border-b border-gray-100">
            <p class="text-sm font-medium text-gray-900">{{ user?.name }}</p>
            <p class="text-xs text-gray-500">{{ user?.email }}</p>
          </div>
          <NotificationBell />
          <NuxtLink
            to="/account"
            @click="showMobileMenu = false"
            class="block py-2.5 text-sm text-gray-700 hover:text-blue-600 transition-colors"
          >
            Tài khoản
          </NuxtLink>
          <NuxtLink
            to="/my-orders"
            @click="showMobileMenu = false"
            class="block py-2.5 text-sm text-gray-700 hover:text-blue-600 transition-colors"
          >
            Đơn hàng của tôi
          </NuxtLink>
          <NuxtLink
            to="/wishlist"
            @click="showMobileMenu = false"
            class="block py-2.5 text-sm text-gray-700 hover:text-blue-600 transition-colors"
          >
            Danh sách yêu thích
          </NuxtLink>
          <button
            @click="handleLogout"
            class="block w-full text-left py-2.5 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            Đăng xuất
          </button>
        </template>
        <template v-else-if="!isLoggedIn">
          <NuxtLink
            to="/login"
            @click="showMobileMenu = false"
            class="block py-2.5 text-sm text-blue-600 font-medium"
          >
            Đăng nhập
          </NuxtLink>
          <NuxtLink
            to="/register"
            @click="showMobileMenu = false"
            class="block py-2.5 text-sm text-blue-600 font-medium"
          >
            Đăng ký
          </NuxtLink>
        </template>
      </div>
    </Transition>
  </header>
</template>
