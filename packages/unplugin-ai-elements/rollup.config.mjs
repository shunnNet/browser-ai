// import typescript from "@rollup/plugin-typescript"
import plugin from "./index.js"

export default {
  input: "./src/index.js", // resolved by our plugin
  plugins: [
    // typescript()
    plugin.rollup(),
  ],
  output: [
    {
      name: "unplugin-vai-elements",
      file: "dist/index.cjs",
      format: "cjs",
    },
    {
      name: "unplugin-vai-elements",
      file: "dist/index.mjs",
      format: "esm",
    },
  ],
}
