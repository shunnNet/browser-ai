# Event and suggestion
`Vai` also contain `AgentEvent` record and `.suggestAction()`, if you don't know what are they, refer to [event and suggest actions](../guide/agent#event-and-suggest-actions).

Except the functionaliy inherit from `Agent`, `Vai` integrate `vue-router`, record page view event when page changed.

```ts
// main.ts
import { createApp } from "vue"
import router from "./router"
import App from "./App.vue"
import { vaiPlugin, VaiPluginOptions } from "@browser-ai/vai"

const app = createApp(App)

// You need include router to activate this feature.
app.use(router).use<VaiPluginOptions[]>(vaiPlugin, { router })

app.mount("#app")
```

`Vai` will record the following when page changed.

```ts
`User enter the page: ${pageName}`
```

The `pageName` will be decided by following rules:
1. When `meta.ai.name` exists, use `meta.ai.name`
2. Or use `route.name`
3. Or use `route.path`

## Use in components
Add record in component is simple, here is a example.

```ts
import { useCreateVai } from "@browser-ai/vai"
import { openaiClient } from "@/api/openai"

// Create new vai instance
const createVai = useCreateVai()
const vai = createVai(openaiClient)

vai.record("User is starting do something...")
```