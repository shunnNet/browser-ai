import { createApp } from "vue"
import router from "./router"
import App from "./App.vue"
import { vaiPlugin } from "@browser-ai/vai"
import "./style.css"
import "virtual:uno.css"
import base from "virtual:ai-elements"
console.log(base)

const app = createApp(App)

app.use(router).use(vaiPlugin, {
  router,
  layer: {
    base: Object.values(base),
  },
  vectorIndex: null,
})

app.mount("#app")
