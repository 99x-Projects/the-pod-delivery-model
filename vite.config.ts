import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** Project site: https://99x-projects.github.io/the-pod-delivery-model/ */
const pagesBase = "/the-pod-delivery-model/";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? pagesBase : "/",
}));
