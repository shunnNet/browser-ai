import { defineConfig, mergeConfig } from "vitest/config"
import viteConfig from "./vite.config"

// Use separate config for tests to avoid issues with
// https://github.com/vitest-dev/vitest/issues/5256

// https://vitest.dev/guide/#configuring-vitest
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // simulate DOM with happy-dom
      // (requires installing happy-dom as a peer dependency)
      environment: "happy-dom",
    },
  }),
)
