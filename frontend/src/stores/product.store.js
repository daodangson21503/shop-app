import { defineStore } from 'pinia';
import http from '../api/axios';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    loading: false,
    selectedCategory: null,
    keyword: '',              // ← thêm
  }),
  getters: {
    filteredProducts: (state) => {
      let result = state.products;

      // Lọc theo danh mục
      if (state.selectedCategory) {
        result = result.filter((p) => p.categoryId === state.selectedCategory);
      }

      // Lọc theo từ khóa
      if (state.keyword.trim()) {
        const kw = state.keyword.toLowerCase();
        result = result.filter((p) =>
          p.name.toLowerCase().includes(kw)
        );
      }

      return result;
    },
  },
  actions: {
    async fetchProducts(params = {}) {
      this.loading = true;
      try {
        const { data } = await http.get('/products', {
          params: { ...params, limit: 100 },
        });
        this.products = data.data;
      } finally {
        this.loading = false;
      }
    },
    setCategory(categoryId) {
      this.selectedCategory = categoryId;
      this.keyword = '';        
    },
    setKeyword(kw) {           
      this.keyword = kw;
      this.selectedCategory = null; 
    },
  },
});