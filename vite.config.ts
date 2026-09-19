import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },

  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html')
      },

      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },

    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext'
  }
});