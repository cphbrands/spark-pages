import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-router-dom")) return "react";
            if (id.includes("@radix-ui")) return "radix";
            if (id.includes("@tanstack")) return "query";
            if (id.includes("firebase")) return "firebase";
            if (id.includes("recharts")) return "recharts";
            if (id.includes("lucide-react")) return "icons";
          }
        },
      },
    },
  },
}));
