import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

/**
 * Сборка для однофайлового превью: весь сайт складывается в один HTML
 * без единого внешнего запроса. Отличия от продакшен-конфига:
 * всё в одном чанке, шрифты инлайнятся как data: URI, маршрутизация
 * через hash, удалённые фотографии отключены.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Полные наборы Fontsource подключают греческий и вьетнамский —
      // в инлайне это лишние сотни килобайт. Подменяем на нужные подмножества.
      '@fontsource-variable/golos-text': fileURLToPath(
        new URL('./src/styles/fonts-preview-golos.css', import.meta.url),
      ),
      '@fontsource-variable/literata/opsz.css': fileURLToPath(
        new URL('./src/styles/fonts-preview-literata.css', import.meta.url),
      ),
    },
  },
  define: {
    'import.meta.env.VITE_HASH_ROUTER': '"1"',
    'import.meta.env.VITE_NO_REMOTE_IMAGES': '"1"',
  },
  build: {
    target: 'es2022',
    outDir: 'dist-preview',
    cssCodeSplit: false,
    // Всё, включая woff2, встраивается в бандл как data: URI.
    assetsInlineLimit: () => true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
