import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: "./tsconfig.app.json",
      entryRoot: "src/promise-dialog",
      include: ["src/promise-dialog/**/*"],
      exclude: ["src/promise-dialog/**/*.spec.ts"],
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: {
        index: fileURLToPath(
          new URL("./src/promise-dialog/index.ts", import.meta.url),
        ),
        vue2: fileURLToPath(
          new URL("./src/promise-dialog/vue2.ts", import.meta.url),
        ),
      },
      name: "VueRenderPromise",
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        `${entryName}.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
