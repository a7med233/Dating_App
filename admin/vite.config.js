import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/admin/', // 👈 THIS IS THE KEY FIX
  plugins: [react()],
  server: {
    port: process.env.PORT || 3001,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  define: {
    'process.env': {},
  },
  resolve: {
    alias: {
      'clsx': 'clsx'
    }
  }
})
