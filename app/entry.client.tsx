import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { registerSW } from "virtual:pwa-register";

if (import.meta.env.PROD) {
  // Register the service worker in production builds only.
  registerSW({ immediate: false });
} else if ("serviceWorker" in navigator) {
  // In dev mode, unregister any lingering service workers from previous
  // production builds or from when devOptions.enabled was true.
  // Active SWs in dev intercept Vite's HMR WebSocket and break hot reload.
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const reg of registrations) {
      reg.unregister();
    }
  });
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
