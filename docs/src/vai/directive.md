# `v-ai` directive
The `v-ai` directive can help you setup `data-ai-id` and `data-ai-description`. You can learn the usage of these 2 attributes at [BrowserNavigationAgent](../guide/browser-agent) page.

The `v-ai` provide almost same functionality with `BrowserNavigationAgent`, but `v-ai` directive automatically collect the DOM node and Vnode, you don't need to call `.collect()`. 


## Setup
To use `v-ai`, you need setup `vaiPlugin`.

```ts
// ...
import { vaiPlugin } from "@browser-ai/vai"

// ...
app.use(vaiPlugin)
```

## Usage
Usa `v-ai` directive in template

```vue
<template>
  <h1 v-ai="{ id: 'title' }">Chatbot playground</h1>
  <p v-ai="{ id: 'paragraph' }">This is a page can play with ai chatbot. You can play with it by the buttons below</p>

  <div 
    v-ai="{
      id: 'actions',
      description: 'Buttons for interact with ai'
    }"
  >
    <!-- a lots of buttons.... -->
</div>
</template>
```

Then we can ask agent to pick element.

```vue
<script setup lang="ts">
import { useCreateVai } from "@browser-ai/vai"
import { openaiClient } from "@/api/openai"

const createVai = useCreateVai()
const vai = createVai(openaiClient)

onMounted(() => {
  vai.check(`User: I want to play with ai !`)

  const element = await vai.whichElement("can fulfill user's purpose")
  // { id, description, el, vnode }

  element.el.scrollIntoView()
})

</script>
```

:::tip
You can also get `vnode` by `element.vnode`
:::
:::warning
Keep in mind if you want do DOM manipulation, you have to do it after `onMounted`
:::

## Combine usage with `.whichRoute()`
It may be common using `v-ai` with [`.whichRoute`](./vue-router) for auto navigation. Check the [combine usage with `.whichElement()`](./vue-router#combine-usage-with-whichelement).

There is a case you may encounter: after router navigation resolved, the element haven't be rendered, because they are waiting API response...So the agent can't see the elements before API respond. This make agent navigate user to wrong element.

`Vai` provide a tool `routerWaiter` to handle this situation.

For example, the following code:

```ts
const navigation = async () => {
  vai.check(`User: do you have any product ?`)

  const route = await vai.whichRoute("can fulfill user's desire")
  if (!route){
    return
  }
  await router.push({ name: route.data.name })
  // navigation resolved

  // But the helpful elements may not exist
  const element = await vai.whichElement("can fulfill user's desire")
  if (!element){
    return
  }
  element.ele.scrollIntoView()
  // ...
}
```
If the DOM node includes product info need wait api response, it is very possible the element haven't be rendered.

So we add `routerWaiter`:

```ts
// PageIndex
import { useRouterWaiter } from "@browser-ai/vai"

const { pendingPush } = useRouterWaiter()

const navigation = async () => {
  // ...

  const route = await vai.whichRoute("can fulfill user's desire")
  // ...
  await pendingPush({ name: route.id })
  
  // ...
}
```

`pendingPush()` works like `router.push()`, but provide extra functionality to pending its promise.

We can call the `pendingNavigation` at the target page, like product page here:

```vue
// PageProduct
<script setup>
import { useRouterWaiter } from "@browser-ai/vai"

const { pendingNavigation } = useRouterWaiter()

// this line will setup pending
const { release } = pendingNavigation()

onMounted(async () => {
  await fetchProductsAndSetup()
  
  // release the pendingPush promise.
  release()
})
</script>
```

When `pendingNavigation` is called, the `pendingPush` will wait util `release` is called. 

We can ensure products exist in the page now, so we can ask `vai` pick a element.


```ts
// PageIndex
import { useRouterWaiter } from "@browser-ai/vai"

const { pendingPush } = useRouterWaiter()

const navigation = async () => {
  // ...

  const route = await vai.whichRoute("can fulfill user's desire")
  // ...
  await pendingPush({ name: route.data.name })
  
  // After release
  const element = await vai.whichElement("can fulfill user's desire")
  if (!element){
    return
  }
  element.ele.scrollIntoView()
}
```

## Navigation failed
Route may has validation. Like a page need user login first, or some permission is needed. Validation can occur in many places, like `beforeEach`, `beforeEnter`...... 

```ts
{
  path: "/",
  component: () => import("@/pages/MemberCenter.vue"),
  name: "MemberCenter",
  meta: {
    ai: {
      title: "MemberCenter",
      description:
        "The page for member only. Member can check their order info, personal info and manage their credit cards.",
    },
  },
  beforeEnter(){
    // only member can enter
    return false
  }
}
```

For these kind of cases, you can handle it by checking `router.push()` or `pendingPush()` returned results describe in [vue-router doc](https://router.vuejs.org/guide/advanced/navigation-failures.html#Detecting-Navigation-Failures).

```ts
// pendingPush directly forwarding `router.push()` result
const navigationFailure = await pendingPush({ name: route.data.name })

if (navigationFailure) {
  // handle navigationFailure
}

// continue...

```