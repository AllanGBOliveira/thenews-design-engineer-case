import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  // loadEnv reads .env files; process.env covers shell-level vars (e.g. RENDER_MODE)
  const env = loadEnv(mode, process.cwd(), "");

  const siteName = env.VITE_SITE_NAME || "thenews";
  const siteShortName = env.VITE_SITE_SHORT_NAME || siteName;
  const siteDescription =
    env.VITE_SITE_DESCRIPTION || "the news — design engineer case";
  // dotenv parses `#` as inline comment, so hex colors must be quoted in .env.
  // Use `||` (not `??`) so an accidentally unquoted empty string still falls back.
  const themeColor = env.VITE_THEME_COLOR || "#000000";
  const bgColor = env.VITE_BG_COLOR || "#ffffff";

  // RENDER_MODE from shell env (not in .env files, set per build script)
  const renderMode = process.env.RENDER_MODE ?? "ssr";

  return {
    plugins: [
      tailwindcss(),
      reactRouter(),
      VitePWA({
        // React Router v7 uses the Vite Environment API with per-environment
        // outDirs (build/client, build/server). vite-plugin-pwa's own outDir
        // falls back to the legacy `dist` default — override it explicitly.
        outDir: "build/client",
        // SW is registered manually in app/entry.client.tsx (production only).
        // injectRegister: null avoids conflicts with React Router v7's SSR HTML.
        injectRegister: null,
        registerType: "autoUpdate",

        // Service workers are PRODUCTION ONLY — never in dev mode.
        // In dev there is no build output, so Workbox glob patterns match nothing.
        // SW would also incorrectly intercept Vite's HMR WebSocket traffic.
        devOptions: {
          enabled: false,
        },

        manifest: {
          name: siteName,
          short_name: siteShortName,
          description: siteDescription,
          theme_color: themeColor,
          background_color: bgColor,
          display: "standalone",
          start_url: "/",
          // Run `npm run pwa:generate` to regenerate all icons from public/favicon.svg
          icons: [
            {
              src: "web-app-manifest-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "web-app-manifest-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },

        workbox: {
          // React Router v7 client build output is always in build/client/
          globDirectory: "build/client/",
          // Precache static assets only — HTML is SSR-generated at request time
          globPatterns: ["**/*.{js,css,ico,png,svg,woff,woff2,webmanifest}"],
          // SSR: navigation requests go to the server (no SW cache).
          // SPA/SSG: SW serves index.html for all routes (offline support).
          navigateFallback: renderMode === "ssr" ? null : "/index.html",
          cleanupOutdatedCaches: true,
          // New SW takes control immediately after autoUpdate activates it
          skipWaiting: true,
          clientsClaim: true,
        },
      }),
      // Return empty JSON for Chrome DevTools auto-discovery so the request
      // never reaches React Router (which throws "No route matches URL").
      {
        name: "handle-chrome-devtools",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (
              req.url ===
              "/.well-known/appspecific/com.chrome.devtools.json"
            ) {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end("{}");
              return;
            }
            next();
          });
        },
      },
    ],
    resolve: {
      tsconfigPaths: true,
    },
  };
});
