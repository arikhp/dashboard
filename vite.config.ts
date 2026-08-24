import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.PAGES_BASE ?? (process.env.GITHUB_ACTIONS ? "/dashboard/" : "/"),
  server: {
    port: 5173,
    strictPort: true,
  },
});
