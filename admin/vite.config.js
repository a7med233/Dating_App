import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT || 3001,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true, // Enable minification for production
    rollupOptions: {
      external: ['@socket.io/component-emitter', 'socket.io-parser'],
      output: {
        manualChunks: undefined,
      },
    },
  },
  define: {
    'process.env': {},
  },
  optimizeDeps: {
    exclude: ['@socket.io/component-emitter']
  }
})
