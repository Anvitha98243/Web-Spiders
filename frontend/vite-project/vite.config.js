import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    // Ensure all assets are copied
    copyPublicDir: true,
  },
  publicDir: 'public', // Ensure public folder is copied
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  // Handle routing for SPA
  base: '/',
})