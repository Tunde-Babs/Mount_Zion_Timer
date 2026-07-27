import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Mount Zion Timer',
        short_name: 'MZ Timer',
        description: 'Professional event & service timer with presenter view.',
        theme_color: '#4f46e5',
        background_color: '#0b0f1a',
        display: 'standalone',
        start_url: '/app',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Presenter/dashboard routes are dynamic and rely on live data — never serve them stale.
        navigateFallbackDenylist: [/^\/present\//]
      }
    })
  ],
  server: {
    port: 5174
    // No /api proxy here — `npm run dev` (this) is frontend-only iteration.
    // For working API calls locally, use `npm run dev:full`, which runs
    // `wrangler pages dev` as the outer server: it serves functions/ itself
    // and proxies everything else to this Vite server.
  }
});
