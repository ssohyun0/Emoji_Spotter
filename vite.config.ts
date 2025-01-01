import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/connect": {
        target: "http://localhost:8080", // 백엔드 주소
        changeOrigin: true,
        secure: false, // HTTPS 인증서 검증 비활성화
      },
    },
  },
});
