import { defineStore } from 'pinia';
import http from '../api/axios';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
  }),
  actions: {
    async fetchCategories() {
      const { data } = await http.get('/categories');
      this.categories = data.data;
    },
  },
});