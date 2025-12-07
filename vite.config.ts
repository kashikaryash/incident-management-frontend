import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Ensure React is included
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://incidentmanagementsystem-backend-production.up.railway.app', // Spring Boot backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
