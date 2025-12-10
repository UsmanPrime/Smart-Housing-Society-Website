import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev proxy lets the frontend call "/api/*" without hardcoding localhost:5000
export default defineConfig({
  plugins: [react({ fastRefresh: true })],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom', 'react-router-dom'],
          'ui-components': ['recharts'],
          'vendor': ['axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
})
