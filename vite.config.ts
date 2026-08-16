import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Codespaces ne peut forwarder que les ports écoutés sur toutes les
    // interfaces, pas juste 127.0.0.1 (comportement par défaut de Vite).
    host: true,
  },
})
