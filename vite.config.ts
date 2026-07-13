import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// ── Image cache ────────────────────────────────────────────────
// Where our media (artist / album / song art) is stored. Arweave content is
// immutable + content-addressed, so a URL's bytes can never change — which makes
// "cache forever, serve from cache first" completely safe (no staleness risk).
// The host regex lives inline in the runtimeCaching rule below (it's serialized
// into the generated SW, which can't see this module's scope).
//
// IMPORTANT: audio/video live on this SAME host, so the rule matches on the
// request *destination* too, NOT host alone. Caching audio was what broke iOS
// playback: <audio> issues Range requests and iOS *requires* a 206 Partial
// Content back, but CacheFirst replays a full 200 / opaque response, so
// CoreMedia clips the first ~second (desktop/Android tolerate it). Restricting
// the rule to `image` requests keeps audio/video going straight to the network.

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // App deploys refresh the service worker automatically — no user prompt,
      // no stale app shell after a release.
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // No installable-app manifest — we only want the runtime image cache.
      manifest: false,
      // Keep the SW OFF during `vite dev` so it can't serve stale assets while
      // you're working. It only runs in production builds / `vite preview`.
      devOptions: { enabled: false },
      workbox: {
        // Precache the built app shell (JS/CSS/html) so repeat visits are instant
        // and the app works offline.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        // Don't bake this heavy one-off image (shown only after applying) into the
        // app-shell precache — it loads normally over the network when needed.
        globIgnores: ['**/Branding/cds_thankyou.png'],
        runtimeCaching: [
          {
            // Only image-destination requests — never audio/video (see above).
            // NOTE: this fn is serialized into the generated SW, so it can't
            // reference outer scope (IMAGE_HOST) — the host regex is inlined.
            urlPattern: ({ url, request }) =>
              request.destination === 'image' &&
              /^https:\/\/.*turbo-gateway\.com\/.*/i.test(url.href),
            handler: 'CacheFirst',
            options: {
              cacheName: 'arweave-images',
              expiration: {
                maxEntries: 300,             // ~most images a session will ever touch
                maxAgeSeconds: 60 * 60 * 24 * 60, // 60 days, then re-fetched once
                purgeOnQuotaError: true,     // evict this cache first if disk fills up
              },
              cacheableResponse: {
                // 200 = normal; 0 = opaque cross-origin response (the gateway
                // serves images without CORS headers, so responses are opaque).
                // Both must be allowed or nothing gets cached.
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
})
