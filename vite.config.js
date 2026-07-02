import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // تم التعديل إلى '/' لأن الموقع أصبح على النطاق الرئيسي مباشرة
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
});