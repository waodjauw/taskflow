import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 部署 GitHub Pages 必须加的路径（改成你的仓库名）
  base: "/test/",

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