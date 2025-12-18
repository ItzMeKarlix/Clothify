import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    tailwindcss(),
    
    react({
      babel: {
        plugins: [
          [ 'babel-plugin-react-compiler']
        ],
      },
    }),
  ],
  server: {
    allowedHosts: [
      '.ngrok-free.dev',
      '.ngrok.io',
      '.ngrok-free.app',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
