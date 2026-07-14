export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  if (!authStore.isLoggedIn || !authStore.isAdmin) {
    return navigateTo('/admin/login')
  }
})
