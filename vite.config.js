import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves this at https://<username>.github.io/grocery-pos/
  // — must match your repo name exactly, including the surrounding slashes.
  base: "/grocery-pos/",
});
