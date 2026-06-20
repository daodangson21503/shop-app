import { defineStore } from 'pinia';
import http from '../api/axios';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    loading: false,
  }),
  actions: {
    async fetchProducts(params = {}) {
      this.loading = true;
      try {
        const { data } = await http.get('/products', { params });
        this.products = data.data;
      } finally {
        this.loading = false;
      }
    },
  },
});