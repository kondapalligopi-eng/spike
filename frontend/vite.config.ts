import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const PROTECTED_PATHS = ['/profile', '/my-dogs', '/my-dogs/new', '/admin'];

// The pre-multi-city category URLs. They still resolve in the app (they
// redirect to the default city) but must NOT be pre-rendered: a file at
// /hospital/index.html would be a second page serving the same listings as
// /bengaluru/hospital, which is duplicate content. Render 301s these in
// front of the app anyway.
const LEGACY_CATEGORY_PATHS = ['/hospital', '/park', '/swimming', '/grooming'];

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
      return paths.filter(
        (p) => !PROTECTED_PATHS.includes(p) && !LEGACY_CATEGORY_PATHS.includes(p),
      );
    },
  },
} as any)
