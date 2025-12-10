import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Ensure React is included
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://incidentmanagementsystem-backend.onrender.com', // Spring Boot backend on Render
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
