import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Local test harness only. Serves dev/index.html with a fake Vantage AI.
export default defineConfig({
  root: fileURLToPath(new URL("./dev", import.meta.url)),
  plugins: [react()],
  server: { port: 5199, fs: { allow: [fileURLToPath(new URL("..", import.meta.url))] } },
  build: { outDir: fileURLToPath(new URL("./dist", import.meta.url)), emptyOutDir: true },
});
