import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cart') || '[]'),
  }),
  getters: {
    total: (state) => state.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0),
    count: (state) => state.items.reduce((sum, i) => sum + i.quantity, 0),
  },
  actions: {
    addItem(product, quantity = 1) {
      const existing = this.items.find((i) => i.id === product.id);
      if (existing) existing.quantity += quantity;
      else this.items.push({ ...product, quantity });
      this.persist();
    },
    removeItem(id) {
      this.items = this.items.filter((i) => i.id !== id);
      this.persist();
    },
    persist() {
      localStorage.setItem('cart', JSON.stringify(this.items));
    },
  },
});