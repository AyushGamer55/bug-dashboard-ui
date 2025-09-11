import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://bug-dashboard-api.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
