import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7071',
        changeOrigin: true,
      },
      // api-gamedb: run `func start --port 7072` in api-gamedb (MyStore Functions use 7071)
      '/gamedb-api': {
        target: 'http://127.0.0.1:7072',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gamedb-api/, '/api'),
      },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
})

