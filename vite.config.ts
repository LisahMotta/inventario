import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "frontend-manual",
  build: {
    outDir: "../dist",
  },
  server: {
    port: 3000,
  },
}); 