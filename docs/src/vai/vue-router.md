# Vue router info
You can add route meta info. After that, we can provide these infos to Vai to pickup a propriate route by conditions.

## Setup
You should pass the `router` instance when `.use(vaiPlugin)` to activate this functionality.

```ts
import { createApp } from "vue"
import router from "./router"
import App from "./App.vue"
import { vaiPlugin } from "@browser-ai/vai"

const app = createApp(App)

// 1-1. You must .use(router)
// 1-2. You must pass `router` to `vaiPlugin` options
app
  .use(router)
  .use(vaiPlugin, { router })

app.mount("#app")

```

## Add route meta
`Vai` will store all route info which has `route.name` and ai meta `route.meta.ai`. These 2 are required.

You must setup `name` and `description` in your `route.meta.ai`, or it will throw when start.

- `name`: A descriptive name of the route
- `description`: A descrition about content or usage of this route

:::info
Dynamic added / removed route are not support.
:::

Here is a route meta example
```ts
// router/index.ts
const routes = [
  {
    path: "/",
    component: () => import("@/pages/PageIndex.vue"),
    name: "Index", // required
    meta: {
      ai: {
        name: "Index", // required
        description: // required
          "This is the index page. Include the chatbot interface which is the main function of this website. The chatbot interface is at the top of the page.",
      },
    },
  },
  {
    path: "/",
    component: () => import("@/pages/PageProduct.vue"),
    name: "Product",
    meta: {
      ai: {
        name: "Product",
        description:
          "This is the product page. User can see the product information and add the product to the cart.",
      },
    },
  },
]
```

## Ask Agent to pick a route
After setup the route, we can ask Vai to pick one of them by `.whicihRoute()`

```ts
// src/pages/PageIndex.vue
import { useCreateVai } from "@browser-ai/vai"
import { openaiClient } from "@/api/openai"
import { useRouter } from "vue-router"

// Create new vai instance
const createVai = useCreateVai()
const vai = createVai(openaiClient)

const router = useRouter()


const navigation = async () => {
  vai.check(`User: do you have any product ?`)

  const route = await vai.whichRoute("can fulfill user's desire")
  // typically, the route will be { id: "Product", description: "This is the product page. User can see the product information and add the product to the cart." }

  if (route) {
    router.push({ name: route.data.name })
  } else {
    // handle no route picked...
  }
}
```

## Usage with `.whichElement()`
We can choose a route base on user's purpose. Navigate to the page may has helpful content to user. After we navigate user, we can combine usage of `v-ai` directive and `.whichElement()`, to automatically scroll to specific element.

```ts

const navigation = async () => {
  vai.check(`User: do you have any product ?`)

  const route = await vai.whichRoute("can fulfill user's desire")
  // typically, the route will be { id: "Product", description: "This is the product page. User can see the product information and add the product to the cart." }
  if (!route){
    // handle no route picked...
    return
  }
  await router.push({ name: route.data.name })

  const element = await vai.whichElement("can fulfill user's desire")
  if (!element){
    // handle no element picked...
    return
  }
  element.ele.scrollIntoView()
  // ...
}
```

Check more usages with [`v-ai`](./directive#combine-usage-with-whichroute).