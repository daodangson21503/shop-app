<template>
  <div class="min-h-screen flex bg-gray-100">
    <AdminSidebar />
    <div class="flex-1 ml-64">
      <header class="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-30">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold text-gray-800">{{ pageTitle }}</h1>
          <div class="flex items-center gap-4">
            <NuxtLink to="/" class="text-sm text-gray-500 hover:text-primary-600 transition">
              Xem website
            </NuxtLink>
          </div>
        </div>
      </header>
      <main class="p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const pageTitle = computed(() => {
  const titles = {
    '/admin': 'Tổng quan',
    '/admin/products': 'Quản lý sản phẩm',
    '/admin/orders': 'Quản lý đơn hàng',
    '/admin/categories': 'Quản lý danh mục',
    '/admin/vouchers': 'Quản lý voucher',
    '/admin/users': 'Quản lý người dùng',
  }
  return titles[route.path] || 'Admin'
})
</script>
