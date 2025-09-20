import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        report: resolve(__dirname, 'report.html'),
        signup: resolve(__dirname, 'signup.html')
      },
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth']
        }
      }
    },
    target: 'esnext',
    minify: 'terser',
    sourcemap: true
  },
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth']
  }
});
