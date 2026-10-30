import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_TARGET = "http://localhost:5000";

const api = { target: API_TARGET, changeOrigin: true };
const ws = { target: API_TARGET, changeOrigin: true, ws: true };

export default defineConfig(({ command }) => ({
  plugins: [react()],

  // Production: hashed assets live under /static/react/ so they never collide
  // with the existing /static/js and /static/css trees. Development: serve from
  // the root so the app's real routes (/devices, /settings, ...) work.
  base: command === "build" ? "/static/react/" : "/",

  build: {
    // Relative to the Vite root (frontend/), so this is app/static/react.
    outDir: "../app/static/react",
    emptyOutDir: true,
  },

  server: {
    port: 5173,
    proxy: {
      // JSON / form endpoints used by the Flask backend.
      "/all-data": api,
      "/data": api,
      "/avg": api,
      "/minmax": api,
      "/get_settings": api,
      "/update_settings": api,
      "/default_settings": api,
      "/notification_history": api,
      "/notification_clear": api,
      "/delete_notification": api,
      "/devices_list": api,
      "/new_device": api,
      "/devices_clear": api,
      "/delete_device": api,
      "/select_device": api,
      "/current_device": api,
      // Flask still owns the shared CSS, fonts, icons and images in dev.
      "/static": api,
      // Socket.IO needs the WebSocket upgrade.
      "/socket.io": ws,
    },
  },
}));
