import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: false, // Disable minification to reduce file operations
    rollupOptions: {
      external: ['@socket.io/component-emitter', 'socket.io-parser'],
      output: {
        manualChunks: undefined, // Disable manual chunks to reduce complexity
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
