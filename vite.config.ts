import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // React barely changes between deploys, so giving it its own chunk
        // keeps it in the service worker cache when the app code moves on.
        // The trailing slash pins the package directory exactly, so neighbours
        // like react-refresh are not swept in.
        manualChunks: (id: string) =>
          /node_modules\/(react|react-dom|scheduler)\//.test(id)
            ? "react"
            : undefined,
      },
    },
  },
  test: {
    // The suite covers the pure game logic, so no DOM is needed.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
