# Render Component
OpneAI gpt return a text response with markdown format in runtime. It is neccessary to render Model response with our component like `RecommendProductList`, `PaymentForm` ...

`Vai` provide simple markdown renderer and prompt template to render model response with component using [vue-llm-rich-message](https://github.com/shunnNet/vue-llm-rich-message) . You can check the documentation and demo in the link


:::info
**NOTE:** `vue-llm-rich-message` accept `{ component: string, description: string }`. But `Vai` accept `{ id: string, description: string }`
:::

Here is an example:
```vue
<script setup lang="ts">
import { computeFormatHint, ComponentMessage } from "@browser-ai/vai"
import { chatCompletion } from "@/api/openai"
import ProductCard from "../components/ProductCard.vue"

const aiResponse = ref("")

const chat = async () => {
  const formatInstruction = computeFormatHint([
    {
      id: "product-list",
      description: "Product list to show a lots of products",
    },
  ])
  const response = await chatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `You are a customer service agent.

${formatInstruction}        
`,
      },
      {
        role: "user",
        content: "I want to buy a pair of shoes.",
      },
    ],
  })

  aiResponse.value = response
}
</script>
<template>
  <button @click="answer">Ask</button>
  <ComponentMessage :message="aiResponse">
    <template #product-list>
      <ProductCard />
    </template>
  </ComponentMessage>
</template>
```

## Directly pass component in
:::warning
Experimental
:::

It is can also pass `Component` with vai options to `computeFormatHint()`. 

```vue
<!-- ProductCard.vue  -->
<script lang="ts">
export default {
  name: "ProductCard",
  // When using vai options, the `component` and `description` is required.
  vai: {
    id: "product-list",
    description: "Product card list for user to choose",
  },
}
</script>
<script setup lang="ts">
// my component logic
</script>

```

```ts
import ProductCard from "../components/ProductCard.vue"
const formatInstruction = computeFormatHint([ProductCard])
```