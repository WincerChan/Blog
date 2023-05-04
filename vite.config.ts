import cloudflareAdapter from "solid-start-cloudflare-pages";
import staticAdpater from "solid-start-static";
import solid from "solid-start/vite";
import UnoCSS from 'unocss/vite';
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import jsonxPlugin from "./plugin/jsonx";

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  plugins: [
    { ...jsonxPlugin(), enforce: "pre" },
    solid({ adapter: isProd ? staticAdpater() : cloudflareAdapter({}), extensions: [".jsonx"] }),
    UnoCSS(),
    VitePWA({
      workbox: {
        cacheId: "wir-cache",
        globPatterns: [],
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: /.*\.html.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'wir-blog',
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wir-images',
              expiration: {
                maxEntries: 20
              }
            }
          },
          {
            urlPattern: /.*\.js.*/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: 'wir-js',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 7 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [200]
              }
            }
          }
        ]
      },
      manifest: {
        name: "Wincer's Blog",
        short_name: "Wincer",
        start_url: "/",
        display: "fullscreen",
        orientation: "natural",
        theme_color: "#065279",
        background_color: "#065279",
        icons: [
          {
            src: "https://cdn.jsdelivr.net/npm/wir@1.0.2/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            "src": "https://cdn.jsdelivr.net/npm/wir@1.0.2/android-chrome-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
          }
        ]
      },
      selfDestroying: false
    })],
});
