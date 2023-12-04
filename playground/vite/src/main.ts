import { createApp } from "vue"
import router from "./router"
import App from "./App.vue"
import { vaiPlugin, connectVueRouter } from "@browser-ai/vai"
import { chatgptAgentClient } from "./api/openai"

const app = createApp(App)

const routeStatus = connectVueRouter(router)

app.use(router).use(vaiPlugin, {
  routeStatus,
  client: chatgptAgentClient,
})

app.mount("#app")
