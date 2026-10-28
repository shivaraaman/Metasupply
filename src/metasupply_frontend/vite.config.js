import { fileURLToPath, URL } from 'url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';

// Canister IDs written by `dfx deploy` (output_env_file in dfx.json).
dotenv.config({ path: '../../.env' });

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/; dfx asset canisters serve it from /.
  base: process.env.BASE_PATH || '/',
  build: {
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4943',
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  // Always define these so the bundle never touches an undefined `process` in the browser.
  define: {
    'process.env.CANISTER_ID_METASUPPLY_BACKEND': JSON.stringify(process.env.CANISTER_ID_METASUPPLY_BACKEND ?? ''),
    'process.env.CANISTER_ID_INTERNET_IDENTITY': JSON.stringify(process.env.CANISTER_ID_INTERNET_IDENTITY ?? ''),
    'process.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK ?? 'local'),
  },
  resolve: {
    alias: [
      {
        find: 'declarations',
        replacement: fileURLToPath(new URL('../declarations', import.meta.url)),
      },
    ],
    dedupe: ['@icp-sdk/core'],
  },
});
