import { defineStore } from 'pinia';
import http from '../api/axios';

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [],
  }),
  getters: {
    productIds: (state) => state.items.map((i) => i.productId),
    isWishlisted: (state) => (productId) => state.items.some((i) => i.productId === productId),
  },
  actions: {
    async fetch() {
      try {
        const { data } = await http.get('/wishlist');
        this.items = data.data;
      } catch {
        this.items = [];
      }
    },
    async toggle(product) {
      const exists = this.isWishlisted(product.id);
      if (exists) {
        await http.delete(`/wishlist/${product.id}`);
        this.items = this.items.filter((i) => i.productId !== product.id);
      } else {
        await http.post('/wishlist', { product_id: product.id });
        this.items.push({ productId: product.id, product });
      }
    },
  },
});