import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Сборка в один файл dist/index.html — его можно открыть в браузере
// двойным щелчком, без сервера и без интернета.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: "./",
});
