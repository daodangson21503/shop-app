import { defineStore } from 'pinia'

interface CartItem {
  id: number
  name: string
  slug: string
  price: number
  imageUrl?: string
  quantity: number
}

export const useCartStore = defineStore('cart', {
  state: () => {
    let items: CartItem[] = []
    if (import.meta.client) {
      try { items = JSON.parse(localStorage.getItem('cart') || '[]') } catch { items = [] }
    }
    return { items }
  },
  getters: {
    total: (state) => state.items.reduce((sum, i) => Number(i.price) * i.quantity + sum, 0),
    count: (state) => state.items.reduce((sum, i) => i.quantity + sum, 0),
  },
  actions: {
    addItem(product: any, quantity = 1) {
      const existing = this.items.find((i) => i.id === product.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity,
        })
      }
      this.persist()
    },
    removeItem(id: number) {
      this.items = this.items.filter((i) => i.id !== id)
      this.persist()
    },
    updateQuantity(id: number, quantity: number) {
      const item = this.items.find((i) => i.id === id)
      if (item) {
        item.quantity = Math.max(1, quantity)
        this.persist()
      }
    },
    clear() {
      this.items = []
      this.persist()
    },
    persist() {
      if (import.meta.client) {
        localStorage.setItem('cart', JSON.stringify(this.items))
      }
    },
  },
})
