import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages publishes this repository under /labspot-frontend/.
// Local development still uses the root path.
const base = process.env.GITHUB_ACTIONS === 'true' ? '/labspot-frontend/' : '/';

export default defineConfig({
  base,
  plugins: [react()],
  server: { port: 5173, host: '0.0.0.0' },
  preview: { port: 4173, host: '0.0.0.0' },
});
