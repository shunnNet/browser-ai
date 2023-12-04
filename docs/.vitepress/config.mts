import { defineConfig } from "vitepress"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Browser AI",
  description: "A VitePress Site",
  srcDir: "src",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/markdown-examples" },
    ],

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Intro", link: "/guide/intro" },
          { text: "Why", link: "/guide/why" },
          { text: "Getting Started", link: "/guide/getting-started" },
          // { text: "Runtime API Examples", link: "/api-examples" },
        ],
      },
      {
        text: "ai-expression",
        items: [{ text: "basic", link: "/ai-expression/basic" }],
      },
      {
        text: "ai-vue",
        items: [{ text: "basic", link: "/ai-vue/basic" }],
      },
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/shunnNet/browser-ai" },
    ],
  },
  locales: {
    root: {
      label: "English",
      lang: "en",
    },
    "zh-TW": {
      label: "繁體中文",
      lang: "zh-Hant-TW",
      link: "/zh-tw/",
    },
  },
})
