import { defineStore } from 'pinia';
import http from '../api/axios';

// Kiểm tra JWT có hết hạn chưa
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // Nếu token hết hạn → xóa luôn
    if (isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { token: null, user: null };
    }

    return { token, user };
  },
  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    async login(email, password) {
      const { data } = await http.post('/auth/login', { email, password });
      this.token = data.data.token;
      this.user = data.data.user;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});