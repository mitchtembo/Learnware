import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

// Use ESM-safe path resolution (avoid referencing __dirname directly)
const srcPath = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': srcPath,
    },
  },
  define: {
    'process.env': {}
  }
})
