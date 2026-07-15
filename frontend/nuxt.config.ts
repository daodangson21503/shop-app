// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/icon',
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBase: '/api',
      googleClientId: '',
    },
  },
  devServer: {
    port: 3002,
  },
  app: {
    head: {
      title: 'ShopGiaDung - Hệ thống bán hàng gia dụng',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'ShopGiaDung - Hệ thống bán hàng gia dụng online' },
      ],
      link: [
        { favicon: { type: 'image/svg+xml', href: '/favicon.svg' } },
      ],
    },
  },
  routeRules: {
    '/api/**': { proxy: { to: `${process.env.API_PROXY_TARGET || 'http://localhost:3000'}/api/**` } },
    '/uploads/**': { proxy: { to: `${process.env.API_PROXY_TARGET || 'http://localhost:3000'}/uploads/**` } },
  },
})
