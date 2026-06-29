import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

// Run `npm run pwa:generate` to regenerate all PWA icons from public/favicon.svg.
// Output files (added to public/):
//   favicon.ico, pwa-64x64.png, pwa-192x192.png, pwa-512x512.png,
//   maskable-icon-512x512.png, apple-touch-icon-180x180.png
// After regenerating, update the icon references in:
//   - vite.config.ts  (manifest.icons)
//   - app/root.tsx    (links function)
export default defineConfig({
  preset: minimal2023Preset,
  images: ["public/favicon.svg"],
});
