import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages 部署时，base 设为仓库名，如 /bio-camp-2026/
// 本地开发和 Vercel/Netlify 部署不需要改
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.BASE_PATH || '/',
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
})
