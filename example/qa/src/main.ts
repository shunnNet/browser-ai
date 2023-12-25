import { createApp } from "vue"
import router from "./router"
import App from "./App.vue"
import { vaiPlugin } from "@browser-ai/vai"
import "./style.css"

const app = createApp(App)

app.use(router).use(vaiPlugin, { router })

app.mount("#app")
