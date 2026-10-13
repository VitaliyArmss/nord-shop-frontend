import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// This is a GitHub Pages project site, published under the repository path.
export default defineConfig({
  base: '/nord-shop-frontend/',
  plugins: [react()],
  server: { port: 5173, host: '0.0.0.0' },
  preview: { port: 4173, host: '0.0.0.0' },
});
