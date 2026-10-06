import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// In dev, /api calls are proxied to the Node server (see server/.env.example for PORT).
const API_TARGET = process.env.VITE_DEV_API_TARGET || 'http://localhost:3001';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: { '/api': API_TARGET },
  },
});
