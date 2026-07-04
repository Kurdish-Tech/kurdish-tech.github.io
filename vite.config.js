import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// A precached entry only gets re-fetched by Workbox when its `revision`
// changes between builds. Hashing the manifest's actual bytes means that
// changes (new words, new translations) always force a refetch, while a
// rebuild that didn't touch the data doesn't churn the cache for nothing.
function dataManifestRevision(dialectKey) {
  const filePath = path.resolve(__dirname, 'public', 'data', dialectKey, 'index.json');
  return createHash('md5').update(readFileSync(filePath)).digest('hex');
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt' instead of 'autoUpdate': a new service worker installs in
      // the background as before, but doesn't silently take over an open
      // tab — the app shows an "update available" banner (see
      // useServiceWorkerUpdate.js) so users get a visible, deliberate way
      // to refresh instead of the page just changing under them.
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      // The word-data chunks (~64MB) are cached at runtime as they're
      // searched, not precached — precaching all of it would bloat the
      // initial install. Only the app shell + per-dialect manifests
      // (needed for the alphabet rail / word counts) are precached.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}'],
        additionalManifestEntries: [
          { url: 'data/ku/index.json', revision: dataManifestRevision('ku') },
          { url: 'data/sor/index.json', revision: dataManifestRevision('sor') },
          { url: 'data/zza/index.json', revision: dataManifestRevision('zza') },
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
            // StaleWhileRevalidate, not CacheFirst: chunk filenames (e.g.
            // "k-2.json") aren't content-hashed like the JS/CSS bundle, so
            // CacheFirst would serve a word list from months ago forever
            // once cached, even after the server's data has been updated.
            // SWR still answers instantly from cache (so search stays
            // fast and works offline), but also refetches in the
            // background whenever online, so the cache heals itself
            // within one extra round-trip instead of staying stale until
            // a 1-year expiry.
            urlPattern: /\/data\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
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
        name: 'Ferheng — Kurdish Dictionary (Kurmancî, Soranî, Zazakî)',
        short_name: 'Ferheng',
        description:
          'A free, offline Kurmancî, Soranî, and Zazakî dictionary with 455,000+ words.',
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
  test: {
    environment: 'jsdom',
    globals: false,
  },
});