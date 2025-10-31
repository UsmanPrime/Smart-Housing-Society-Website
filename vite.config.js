import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev proxy lets the frontend call "/api/*" without hardcoding localhost:5000
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // No pathRewrite needed because API already starts with /api
      },
    },
  },
})
