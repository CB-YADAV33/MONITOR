import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath, URL } from "url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./client/src", import.meta.url)),
      "@shared": fileURLToPath(new URL("./shared", import.meta.url)),
      "@assets": fileURLToPath(new URL("./attached_assets", import.meta.url)),
    },
  },
  root: fileURLToPath(new URL("./client", import.meta.url)),
  server: {
    host: "0.0.0.0",
    port: 5000,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://localhost:3000",
        ws: true,
      },
    },
  },
  build: {
    outDir: fileURLToPath(new URL("./dist/public", import.meta.url)),
    emptyOutDir: true,
  },
});
