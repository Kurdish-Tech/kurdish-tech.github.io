import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      // The word-data chunks (~64MB) are cached at runtime as they're
      // searched, not precached — precaching all of it would bloat the
      // initial install. Only the app shell + per-dialect manifests
      // (needed for the alphabet rail / word counts) are precached.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}'],
        additionalManifestEntries: [
          { url: 'data/ku/index.json', revision: null },
          { url: 'data/sor/index.json', revision: null },
        ],
        // This app is hash-routed (see useHashRoute.js), so it only ever
        // needs the offline navigation fallback for the bare root path.
        // Without this, the SW's NavigationRoute intercepts every
        // same-origin navigation — including sibling GitHub Pages project
        // sites under kurdish-tech.github.io/<other-repo>/ — and wrongly
        // serves this app's cached index.html instead of letting GitHub
        // Pages serve the other repo.
        navigateFallbackDenylist: [/^\/.+/],
        runtimeCaching: [
          {
            urlPattern: /\/data\/.*\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ferheng-data',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'ferheng-google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ferheng-google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'Ferheng — Kurmancî ⇄ Soranî Dictionary',
        short_name: 'Ferheng',
        description:
          'A free, offline Kurmancî and Soranî Kurdish dictionary with 453,000+ words.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
});