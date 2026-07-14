import { defineStore } from 'pinia'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [] as any[],
    loading: false,
    selectedCategory: null as number | null,
    keyword: '',
  }),
  getters: {
    filteredProducts: (state) => {
      let result = state.products
      if (state.selectedCategory) {
        result = result.filter((p) => p.categoryId === state.selectedCategory)
      }
      if (state.keyword.trim()) {
        const kw = state.keyword.toLowerCase()
        result = result.filter((p) => p.name.toLowerCase().includes(kw))
      }
      return result
    },
  },
  actions: {
    async fetchProducts(params: any = {}) {
      this.loading = true
      try {
        const api = useApi()
        const res = await api<any>('/products', { params: { ...params, limit: 100 } })
        this.products = res.data?.products || res.data || []
      } finally {
        this.loading = false
      }
    },
    setCategory(categoryId: number | null) {
      this.selectedCategory = categoryId
      this.keyword = ''
    },
    setKeyword(kw: string) {
      this.keyword = kw
      this.selectedCategory = null
    },
  },
})
