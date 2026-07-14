export const useApi = () => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      if (import.meta.client) {
        const token = localStorage.getItem('token')
        if (token) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          }
        }
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        if (import.meta.client) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
    },
  })

  return api
}
