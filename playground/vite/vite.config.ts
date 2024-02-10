import { resolve } from "path"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
// import vaiElement from "@browser-ai/unplugin-vai-elements"
// import { app, router } from "./src/vaiEntry"
import plugin from "@browser-ai/unplugin-ai-elements"
import UnoCSS from "unocss/vite"

// https://vitejs.dev/config/
// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  plugins: [
    plugin.vite({
      includes: ["./src/**/*.vue"],
    }),
    vue(),
    UnoCSS(),
    // vaiElement({
    //   root: app,
    //   router,
    // }),
    // msw({ handlers, mode: "browser" }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  // build: {
  //   copyPublicDir: false,
  //   lib: {
  //     entry: resolve(__dirname, "src/main.ts"),
  //     name: "test",
  //     fileName: "index",
  //   },
  //   rollupOptions: {
  //     external: ["vue", "vai-elements.js"],
  //     output: {
  //       // Provide global variables to use in the UMD build
  //       // for externalized deps
  //       globals: {
  //         vue: "Vue",
  //       },
  //     },
  //   },
  // },
})
