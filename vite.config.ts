import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";
// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === "serve";
  const extensionManifest = { ...manifest };

  // In development, we need a content script for the CRXJS plugin to function correctly
  // and establish HMR connections. We invoke a benign script.
  if (isDev) {
    // @ts-expect-error - content_scripts is missing in the type definition of the imported JSON but valid in manifest
    extensionManifest.content_scripts = [
      {
        matches: ["<all_urls>"],
        js: ["src/extension/contentScript.ts"],
      },
    ];
  }

  return {
    plugins: [react(), tailwindcss(), crx({ manifest: extensionManifest })],
  };
});
