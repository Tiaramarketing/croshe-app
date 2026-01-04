import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',                  // Ensures assets load correctly at the root of your domain
  server: {
    host: '0.0.0.0',          // Allows access from outside the container during dev/preview
    port: 8080
  },
  preview: {
    host: '0.0.0.0',
    port: 8080
  }
});