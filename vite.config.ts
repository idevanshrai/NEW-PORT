import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // three.js lives in its own lazy-loaded chunk (Scene3D); that's expected to be big.
    chunkSizeWarningLimit: 1000,
  },
})
