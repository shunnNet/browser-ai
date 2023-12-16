import { resolve } from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AiExpression",
      formats: ["es", "umd", "cjs"],
      fileName: (format, entryAlias) => {
        if (entryAlias === "index") {
          switch (format) {
            case "es":
              return "index.js"
            case "umd":
              return "index.umd.js"
            case "cjs":
              return "index.cjs"
          }
        }
        return "index"
      },
    },
  },
})
