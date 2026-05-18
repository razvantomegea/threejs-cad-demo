import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative assets: works at github.io/three-test/ and at custom-domain root.
  base: "./",
  plugins: [react()],
});
