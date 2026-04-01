import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // هذي الكلمة السحرية اللي تجبره يفتح الباب لدوكر (0.0.0.0)
    port: 5173,
    strictPort: true,
  }
});