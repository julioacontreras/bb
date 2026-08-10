import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // En GitHub Pages el sitio vive en un subdirectorio
  // (https://julioacontreras.github.io/bb/); en Netlify y en local, en la raíz.
  base: process.env.GITHUB_ACTIONS ? '/bb/' : '/',
  plugins: [react()],
  server: { host: true },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => (id.includes('node_modules/phaser') ? 'phaser' : undefined),
      },
    },
  },
})
