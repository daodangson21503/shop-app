import { defineStore } from 'pinia'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [] as any[],
  }),
  actions: {
    async fetchCategories() {
      const api = useApi()
      const res = await api<any>('/categories')
      this.categories = res.data
    },
  },
})
