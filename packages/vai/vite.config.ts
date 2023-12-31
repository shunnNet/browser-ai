import { resolve } from "path"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [vue(), dts({ rollupTypes: true })],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    copyPublicDir: false,

    // https://vitejs.dev/guide/build.html#library-mode
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Vai",
      formats: ["es", "umd", "cjs"],
      fileName: (format, entryAlias) => {
        if (entryAlias === "index") {
          switch (format) {
            case "es":
              return "index.js"
            case "umd":
              return "umd/index.js"
            case "cjs":
              return "index.cjs"
          }
        }
        return "index"
      },
    },
    rollupOptions: {
      external: ["vue", "vue-router"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: "Vue",
          "vue-router": "VueRouter",
        },
      },
    },
  },
})
