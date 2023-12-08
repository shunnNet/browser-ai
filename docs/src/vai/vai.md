# Vai
`Vai` provides `Agent` and some small tools that integrate with the `Vue` ecosystem. It is recommended to first go through the [documentation for Agent](../guide/agent) for better understanding.

First, you need to install it.

```sh
pnpm install @browser-ai/vai
```

Then use it plugin.

```ts
// main.ts
import { createApp } from "vue"
import { vaiPlugin } from "@browser-ai/vai"
import { openaiClient } from "./api/openai"
import App from "./App.vue"

const app = createApp(App)

app.use(vaiPlugin)

app.mount("#app")
```

This is the recommended installation method, and you will gradually see some other uses in the subsequent documentation.

## Init Agent
`Vai` also provide a `VueAgent` (a type of `Agent`), so it inherit all methods from `Agent`

You can create vai by `createVai()` composition function.

```ts
import { useCreateVai } from "@browser-ai/vai"
import { openaiClient } from "@/api/openai"

// Create new vai instance
const createVai = useCreateVai()
const vai = createVai(openaiClient)
```

Then use it like `Agent`
```ts
// Vai, check this content
vai.check(`
Dog: I don't want to play with ai !
Cat: I want to play with ai !
Panda: I just want to sleep !
`)

// does "cat want to play with ai" ?
await vai.does("cat want to play with ai")
// typically be true

// After all done... Vai, forget it.
vai.forget()
```

## Usage
`@browser-ai/vai` also provide functionality with `vue-router`, `component`, `DOM`, you can check the topic interested in.

- [Render model response with component](./render-component)
- [Navigation with routes](./vue-router)
- [Navigation with elements](./directive)
- [Suggest actions base on user's action records](./event-and-suggestion.md)