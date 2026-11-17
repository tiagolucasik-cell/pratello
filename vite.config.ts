import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // As chamadas /api do front vão para a API Express (server/index.ts)
    proxy: { '/api': 'http://localhost:3333' },
  },
});
