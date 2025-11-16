import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
    allowedHosts: ['campus-share-2.onrender.com', 'localhost', '127.0.0.1'],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        dead_code: true,
        unused: false, // Keep unused code to prevent ID issues
      },
      mangle: {
        keep_fnames: true, // Keep function names
        reserved: ['translate-page', 'save-page'], // Reserve problematic IDs
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', 'lucide-react'],
        },
      },
      external: [],
      onwarn(warning, warn) {
        // Suppress 'Module level directives cause errors when bundled' warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __DEV__: false,
  },
  esbuild: {
    drop: ['console', 'debugger'],
    pure: ['console.log'],
  },
})
