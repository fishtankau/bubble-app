import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from https://fishtankau.github.io/bubble-app/ — the base path must
// match the repo name so built asset URLs resolve correctly on GitHub Pages.
export default defineConfig({
  base: '/bubble-app/',
  plugins: [react()],
  server: { host: true, port: 5173 },
})
