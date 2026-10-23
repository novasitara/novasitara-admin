import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The API (novasitara-api) runs on port 3000. In production Nginx forwards /api and /uploads the same way.
const api = { target: 'http://localhost:3000', changeOrigin: true }

export default defineConfig({
  plugins: [react()],
  server: { port: 5174, proxy: { '/api': api, '/uploads': api } },
  build: {
    chunkSizeWarningLimit: 600,
  },
})
