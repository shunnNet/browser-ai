import { resolve } from "path"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// https://vitejs.dev/config/
// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  plugins: [
    vue(),
    // msw({ handlers, mode: "browser" }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "test",
      fileName: "index",
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: "Vue",
        },
      },
    },
  },
})
