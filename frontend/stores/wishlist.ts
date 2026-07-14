import { defineStore } from 'pinia'

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [] as any[],
  }),
  getters: {
    productIds: (state) => state.items.map((i) => i.productId),
    isWishlisted: (state) => (productId: number) => state.items.some((i) => i.productId === productId),
  },
  actions: {
    async fetch() {
      try {
        const api = useApi()
        const res = await api<any>('/wishlist')
        this.items = res.data
      } catch {
        this.items = []
      }
    },
    async toggle(product: any) {
      const api = useApi()
      const exists = this.isWishlisted(product.id)
      if (exists) {
        await api(`/wishlist/${product.id}`, { method: 'DELETE' })
        this.items = this.items.filter((i) => i.productId !== product.id)
      } else {
        await api('/wishlist', { method: 'POST', body: { product_id: product.id } })
        this.items.push({ productId: product.id, product })
      }
    },
  },
})
