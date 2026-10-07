import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://app-f57c4746-3838-4314-8c7e-de2713c61ef2.cleverapps.io",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "https://app-f57c4746-3838-4314-8c7e-de2713c61ef2.cleverapps.io",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});