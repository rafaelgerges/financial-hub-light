// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
// import path from "path";
// import { VitePWA } from "vite-plugin-pwa";

// // https://vitejs.dev/config/
// export default defineConfig(({ mode }) => ({
//   server: {
//     host: "::",
//     port: 8080,
//   },
//   plugins: [
//     react(),
//     VitePWA({
//       registerType: 'autoUpdate',
//       manifestFilename: 'manifest.json',
//       includeAssets: ['favicon.ico', 'robots.txt', 'placeholder.svg'],
//       manifest: {
//         name: 'Finance Hub - Controle Financeiro',
//         short_name: 'Finance Hub',
//         description: 'Aplicação de controle financeiro empresarial',
//         theme_color: '#1e293b',
//         background_color: '#f8fafc',
//         display: 'standalone',
//         orientation: 'portrait-primary',
//         scope: '/',
//         start_url: '/',
//         icons: [
//           {
//             src: '/favicon.ico',
//             sizes: '64x64 32x32 24x24 16x16',
//             type: 'image/x-icon'
//           },
//           {
//             src: '/icon-192.png',
//             sizes: '192x192',
//             type: 'image/png',
//             purpose: 'any maskable'
//           },
//           {
//             src: '/icon-512.png',
//             sizes: '512x512',
//             type: 'image/png',
//             purpose: 'any maskable'
//           }
//         ],
//         categories: ['finance', 'business', 'productivity']
//       },
//       workbox: {
//         globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
//         // SPA: todas as rotas servem index.html offline (não apenas /)
//         navigateFallback: '/index.html',
//         navigateFallbackAllowlist: [/^\//],
//         runtimeCaching: [
//           {
//             urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
//             handler: 'CacheFirst',
//             options: {
//               cacheName: 'google-fonts-cache',
//               expiration: {
//                 maxEntries: 10,
//                 maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
//               },
//               cacheableResponse: {
//                 statuses: [0, 200]
//               }
//             }
//           },
//           {
//             urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
//             handler: 'CacheFirst',
//             options: {
//               cacheName: 'images-cache',
//               expiration: {
//                 maxEntries: 50,
//                 maxAgeSeconds: 60 * 60 * 24 * 30 // 30 dias
//               }
//             }
//           }
//         ]
//       },
//       devOptions: {
//         enabled: true,
//         type: 'module',
//         // SPA: fallback para todas as rotas em dev (offline)
//         navigateFallbackAllowlist: [/^\//],
//       }
//     })
//   ].filter(Boolean),
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// }));

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  // ✅ Ajuste aqui com o nome do seu repositório (Project Pages)
  // Se seu repo for "seuuser.github.io", então deixe base = "/"
  const base = mode === "production" ? "/finance-hub-lite/" : "/";

  return {
    base, // ✅ ESSENCIAL para GitHub Pages

    server: {
      host: "::",
      port: 8080,
    },

    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        manifestFilename: "manifest.json",
        includeAssets: ["favicon.ico", "robots.txt", "placeholder.svg"],

        manifest: {
          name: "Finance Hub - Controle Financeiro",
          short_name: "Finance Hub",
          description: "Aplicação de controle financeiro empresarial",
          theme_color: "#1e293b",
          background_color: "#f8fafc",
          display: "standalone",
          orientation: "portrait-primary",

          // ✅ Em Pages não pode ficar "/"
          scope: base,
          start_url: base,

          // ✅ IMPORTANTÍSSIMO: sem "/" no começo (caminho relativo)
          icons: [
            {
              src: "favicon.ico",
              sizes: "64x64 32x32 24x24 16x16",
              type: "image/x-icon",
            },
            {
              src: "icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],

          categories: ["finance", "business", "productivity"],
        },

        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],

          // ✅ Em Pages, o fallback também precisa respeitar o base
          navigateFallback: `${base}index.html`,
          navigateFallbackAllowlist: [/^\//],

          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "images-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],
        },

        devOptions: {
          enabled: true,
          type: "module",
          navigateFallbackAllowlist: [/^\//],
        },
      }),
    ].filter(Boolean),

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
