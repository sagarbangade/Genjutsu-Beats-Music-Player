import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    watch: {
      usePolling: true,
    },
    proxy: {
      "/api": {
        target: "https://genjutsu-beats-music-player.onrender.com", // Your backend server address
        changeOrigin: true,
      },
    },
  },
});
