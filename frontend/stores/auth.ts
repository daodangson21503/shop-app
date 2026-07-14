import { defineStore } from 'pinia'

interface User {
  id: string
  full_name: string
  role: string
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    let token: string | null = null
    let user: User | null = null

    if (import.meta.client) {
      token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try { user = JSON.parse(userStr) } catch { user = null }
      }

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          if (payload.exp * 1000 < Date.now()) {
            token = null
            user = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
        } catch {
          token = null
          user = null
        }
      }
    }

    return { token, user }
  },
  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    async login(email: string, password: string) {
      const api = useApi()
      const res = await api<any>('/auth/login', { method: 'POST', body: { email, password } })
      const data = res.data
      this.token = data.token
      this.user = data.user
      if (import.meta.client) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    },
    async googleLogin(credential: string) {
      const api = useApi()
      const res = await api<any>('/auth/google', { method: 'POST', body: { credential } })
      const data = res.data
      this.token = data.token
      this.user = data.user
      if (import.meta.client) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    },
    logout() {
      this.token = null
      this.user = null
      if (import.meta.client) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },
  },
})
