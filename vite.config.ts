import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    // Don't treat warnings as errors during build
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore warnings during build
        if (warning.code === "UNUSED_EXTERNAL_IMPORT") return;
        // In production (like Vercel), suppress more warnings
        if (mode === "production") {
          if (warning.code === "CIRCULAR_DEPENDENCY") return;
          if (warning.code === "EVAL") return;
        }
        warn(warning);
      },
    },
    // Don't minify during development for faster builds
    minify: mode === "production" ? "esbuild" : false,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  esbuild: {
    // Don't fail build on warnings
    logOverride: { "this-is-undefined-in-esm": "silent" },
    // Drop console and debugger in production
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
}));
