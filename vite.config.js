import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: process.env.BASE_PATH || "/",

  plugins: [vue()],
  resolve: {
    alias: { '@': '/src' }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})