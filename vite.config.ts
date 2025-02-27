import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/webview',
    assetsDir: 'dist/webview',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './src/webview/index.tsx'
      },
      output: {
        entryFileNames: 'main.js',
        format: 'iife'
      }
    }
  }
});
