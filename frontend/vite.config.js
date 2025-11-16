import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      port: 3000,
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
      port: 3000,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      chunkSizeWarningLimit: 1000,
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: true,
          dead_code: true,
          unused: false,
        },
        mangle: {
          keep_fnames: true,
          reserved: [
            'translate-page',
            'save-page',
            'chrome-extension',
            'extension-install',
            'nav-home',
            'nav-notes',
            'nav-community',
            'nav-dashboard',
            'nav-upload',
            'nav-add',
            'nav-bookmarks'
          ],
        },
        format: {
          comments: false,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react';
              }
              if (id.includes('react-router')) {
                return 'router';
              }
              if (id.includes('lucide-react') || id.includes('@headlessui')) {
                return 'ui';
              }
              return 'vendor';
            }
          },
          // Prevent conflicts with browser extensions
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/css/i.test(ext)) {
              return `assets/styles/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
        external: [],
        onwarn(warning, warn) {
          // Suppress specific warnings that don't affect functionality
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          if (warning.code === 'EVAL') return;
          warn(warning);
        },
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      __DEV__: JSON.stringify(!isProduction),
    },
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
      pure: isProduction ? ['console.log'] : [],
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'lucide-react',
        'react-hot-toast'
      ],
    },
  };
});
