import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/connect": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/broad-room-ready": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/broad-answer-after-3seconds": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/players": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/rooms": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
