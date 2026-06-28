import type { Config } from "@react-router/dev/config";

// RENDER_MODE is set via env at build time (not exposed to client — no VITE_ prefix)
//   ssr  → server-side rendering, requires Node.js (default)
//   spa  → single-page app, no server, serve static files from build/client/
//   ssg  → pre-rendered static HTML for all routes, served as static files
const renderMode = process.env.RENDER_MODE ?? "ssr";

const config: Config = {
  // ssr: false enables SPA mode (no server bundle, client-side routing only)
  ssr: renderMode !== "spa",
};

// SSG: pre-render all app routes to static HTML at build time.
// The pre-rendered HTML is placed in build/client/<route>/index.html.
if (renderMode === "ssg") {
  config.prerender = async () => ["/", "/habits", "/cup", "/books", "/more"];
}

export default config satisfies Config;
