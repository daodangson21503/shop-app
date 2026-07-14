<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useApi } from '~/composables/useApi'

const api = useApi()

const isOpen = ref(false)
const notifications = ref([])
const unreadCount = ref(0)
const loading = ref(false)
const fetching = ref(false)
const bellRef = ref(null)
const panelRef = ref(null)

let pollInterval = null

const hasUnread = computed(() => unreadCount.value > 0)
const hasNotifications = computed(() => notifications.value.length > 0)

async function fetchUnreadCount() {
  try {
    const response = await api('/notifications/unread-count')
    if (response.success) {
      unreadCount.value = response.data?.count ?? response.data ?? 0
    }
  } catch (e) {
    console.error('Failed to fetch unread count:', e)
  }
}

async function fetchNotifications() {
  if (fetching.value) return
  fetching.value = true
  loading.value = true
  try {
    const response = await api('/notifications', { params: { limit: 20 } })
    if (response.success) {
      notifications.value = response.data?.notifications || response.data || []
    }
  } catch (e) {
    console.error('Failed to fetch notifications:', e)
  } finally {
    fetching.value = false
    loading.value = false
  }
}

async function markAsRead(notification) {
  if (notification.isRead || notification.is_read) return
  try {
    const id = notification.id
    const response = await api(`/notifications/${id}/read`, { method: 'PATCH' })
    if (response.success) {
      notification.isRead = true
      notification.is_read = true
      if (unreadCount.value > 0) {
        unreadCount.value--
      }
    }
  } catch (e) {
    console.error('Failed to mark as read:', e)
  }
}

async function markAllAsRead() {
  try {
    const response = await api('/notifications/read-all', { method: 'PATCH' })
    if (response.success) {
      notifications.value.forEach((n) => {
        n.isRead = true
        n.is_read = true
      })
      unreadCount.value = 0
    }
  } catch (e) {
    console.error('Failed to mark all as read:', e)
  }
}

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value && !hasNotifications.value) {
    fetchNotifications()
  }
}

function close() {
  isOpen.value = false
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`
  if (diffHour < 24) return `${diffHour} giờ trước`
  if (diffDay < 7) return `${diffDay} ngày trước`
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function handleClickOutside(e) {
  if (bellRef.value && !bellRef.value.contains(e.target) && panelRef.value && !panelRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  fetchUnreadCount()
  pollInterval = setInterval(fetchUnreadCount, 30000)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative">
    <!-- Bell Button -->
    <button
      ref="bellRef"
      @click.stop="toggle"
      class="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      <!-- Badge -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="scale-0"
        enter-to-class="scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="scale-100"
        leave-to-class="scale-0"
      >
        <span
          v-if="hasUnread"
          class="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </Transition>
    </button>

    <!-- Dropdown Panel -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <div
        v-if="isOpen"
        ref="panelRef"
        class="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
        @click.stop
      >
        <!-- Panel Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 class="text-sm font-bold text-gray-900">Thông báo</h3>
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        <!-- Panel Content -->
        <div class="max-h-96 overflow-y-auto">
          <!-- Loading -->
          <div v-if="loading" class="flex items-center justify-center py-10">
            <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="!hasNotifications"
            class="flex flex-col items-center justify-center py-10 text-center px-4"
          >
            <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <p class="text-sm text-gray-500 font-medium">Chưa có thông báo</p>
            <p class="text-xs text-gray-400 mt-1">Các thông báo mới sẽ xuất hiện ở đây</p>
          </div>

          <!-- Notification List -->
          <template v-else>
            <div
              v-for="notification in notifications"
              :key="notification.id"
              @click="markAsRead(notification)"
              class="relative flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors"
              :class="[
                (notification.isRead === false || notification.is_read === false)
                  ? 'bg-blue-50/50 hover:bg-blue-50'
                  : 'hover:bg-gray-50'
              ]"
            >
              <!-- Unread Indicator -->
              <span
                v-if="notification.isRead === false || notification.is_read === false"
                class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"
              ></span>
              <span v-else class="w-2 mt-2 flex-shrink-0"></span>

              <!-- Icon -->
              <div
                class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                :class="[
                  notification.type === 'order' || notification.type === 'order_status'
                    ? 'bg-green-100 text-green-600'
                    : notification.type === 'promotion' || notification.type === 'voucher'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-blue-100 text-blue-600'
                ]"
              >
                <svg
                  v-if="notification.type === 'order' || notification.type === 'order_status'"
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <svg
                  v-else-if="notification.type === 'promotion' || notification.type === 'voucher'"
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <svg
                  v-else
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm leading-snug"
                  :class="[
                    (notification.isRead === false || notification.is_read === false)
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600'
                  ]"
                >
                  {{ notification.title || notification.message }}
                </p>
                <p
                  v-if="notification.body || notification.description || notification.content"
                  class="text-xs text-gray-500 mt-0.5 line-clamp-2"
                >
                  {{ notification.body || notification.description || notification.content }}
                </p>
                <p class="text-[11px] text-gray-400 mt-1">
                  {{ formatTime(notification.createdAt || notification.created_at || notification.time) }}
                </p>
              </div>
            </div>
          </template>
        </div>

        <!-- Panel Footer -->
        <div v-if="hasNotifications" class="border-t border-gray-100 px-4 py-2.5 text-center">
          <NuxtLink
            to="/notifications"
            @click="close"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Xem tất cả thông báo
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>
