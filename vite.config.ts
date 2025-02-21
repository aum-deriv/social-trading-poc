import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      includeAssets: ['champion_logo-blue.svg', 'apple-touch-icon-180x180.png', 'masked-icon.svg'],
      manifest: {
        name: 'Champion Social Trading',
        short_name: 'Champion',
        description: 'Social trading platform with AI insights',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        screenshots: [
          {
            src: 'screenshot-1.png',
            type: 'image/png',
            sizes: '1080x1920',
          },
          {
            src: 'screenshot-2.png',
            type: 'image/png',
            sizes: '1080x1920',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: '/src' },
      { find: '@types', replacement: '/src/types' },
      { find: '@components', replacement: '/src/components' },
      { find: '@modules', replacement: '/src/modules' },
      { find: '@pages', replacement: '/src/pages' },
      { find: '@utils', replacement: '/src/utils' },
      { find: '@constants', replacement: '/src/constants' },
      { find: '@layouts', replacement: '/src/layouts' },
    ],
  },
});
