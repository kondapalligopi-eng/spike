import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const PROTECTED_PATHS = ['/profile', '/my-dogs', '/my-dogs/new', '/admin'];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  ssgOptions: {
    entry: 'src/main.tsx',
    script: 'async',
    formatting: 'none',
    dirStyle: 'nested',
    includedRoutes(paths: string[]) {
      return paths.filter((p) => !PROTECTED_PATHS.includes(p));
    },
  },
} as any)
