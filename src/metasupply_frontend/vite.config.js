import { fileURLToPath, URL } from 'url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';
import polyfillNode from 'rollup-plugin-polyfill-node';

dotenv.config({ path: '../../.env' });

export default defineConfig({
  // *** THIS IS THE CRUCIAL CHANGE ***
  // Set the base path for your application.
  // Using '/' makes paths absolute from the canister's root,
  // which aligns with your <base href="/"> in index.html and dfx.json's serving behavior.
  base: './', 
  // **********************************
  build: {
    target: 'es2020', // Ensure compatibility for IC deployment
    outDir: 'dist',   // Output directory for the build (matches dfx.json)
    emptyOutDir: true, // Clean the output directory before building
    rollupOptions: {
      plugins: [polyfillNode()],
      output: {
        intro: 'const global = globalThis;',
        entryFileNames: `[name]-[hash].js`,      // For entry chunks (like main.js)
        chunkFileNames: `[name]-[hash].js`,      // For dynamically imported chunks
        assetFileNames: `[name]-[hash].[ext]`,  
      },
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
  ],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(
          new URL("../../declarations", import.meta.url)
        ),
      },
      {
        find: 'buffer',
        replacement: 'buffer'
      },
      {
        find: 'process',
        replacement: 'process/browser'
      }
    ],
    dedupe: ['@dfinity/agent'],
  },
  define: {
    global: 'globalThis'
  }
});
