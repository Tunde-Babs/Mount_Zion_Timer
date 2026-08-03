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
        name: 'Platform Timer',
        short_name: 'PT Timer',
        description: 'Professional countdown timer for conferences, services, and live events, with presenter view.',
        theme_color: '#4f46e5',
        background_color: '#0b0f1a',
        display: 'standalone',
        start_url: '/app',
        // Maskable gets its own file: launchers crop it to a circle/squircle, so
        // the artwork needs padding into the middle ~80% and a solid backdrop.
        // Reusing the plain icon here (as this did) clipped the stopwatch crown.
        // Regenerate all of these from favicon.svg with `npm run icons`.
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
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
