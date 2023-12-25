<script setup lang="ts">
import { createVai } from "@browser-ai/vai"
import { chatgptAgentClient } from "../api/openai"
import { onMounted, ref } from "vue"
import { getEmbedding } from "client-vector-search"
import { embeddingIndex } from "../embedding"

const vai = createVai(chatgptAgentClient)
const question = ref("")

const ask = async () => {
  const results = await embeddingIndex.search(
    await getEmbedding(question.value),
  )
  const elements = results.map((result) =>
    vai.elementStore.getElementById(result.object.id),
  )
  // answer by vector search results
  await vai.client({
    prompt: `Answer the question in "Question" section based on document in "Documents" section.
---Documents---
${vai.prompt.items(elements, "document")}

---Question---:
${question.value}

---Answer---

`,
  })
  elements[0].el.scrollIntoView()
}
onMounted(() => {
  Object.values(vai.elementStore.elements).forEach(async (element) => {
    embeddingIndex.add({
      id: element.id,
      name: element.id,
      embedding: await getEmbedding(element.description),
    })
  })
})
</script>
<template>
  <form @submit.prevent="ask">
    <input type="text" v-model="question" />
    <button>Ask</button>
  </form>
  <article>
    <h1>Getting Started</h1>
    <p>To install package via package manager.</p>
    <pre>
      <code>
        pnpm install @browser-ai/ai-expression@0.4.3
      </code>
    </pre>
    <section v-ai="{ id: 'Install via CDN' }">
      <h2>Via <strong>CDN</strong></h2>
      <p>
        You can import cdn package from
        "https://unpkg.com/@browser-ai/ai-expression@0.4.3/dist/umd/index.js
      </p>
      <pre>
        <code>
// Then access all features from `AiExpression`
window.AiExpression
window.AiExpression.Agent
        </code>
      </pre>
    </section>
    <section>
      <h2>Setup browser-ai client</h2>
      <p v-ai="{ id: 'How to setup browser-ai client' }">
        First, You need to prepare a client that connects to the LLM service.
        The client is an async function that takes a `prompt` and a
        `systemMessage` as input. You'll need to call the LLM service and return
        a `string` in response. Here is a example connect to openai
        `/chatCompletion` endpoint.
      </p>
      <pre>
        <code>
          import type { AgentClient } from "@browser-ai/ai-expression"
// ./src/openaiClient.ts

// How this function like will depend on your LLM service endpoints

export const chatCompletion = async (payload: any) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    mode: "cors",
    body: JSON.stringify(payload),
  }).then((res) => res.json())

  return response.choices[0].message.content
}

export const openaiClient: AgentClient = async ({
  prompt,
  systemMessage,
}) => {
  const messages = []
  if (systemMessage) {
    messages.push({
      role: "system",
      content: systemMessage,
    })
  }
  messages.push({
    role: "user",
    content: prompt,
  })
  const message = await chatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages,
  })

  return message as string
}
        </code>
      </pre>
    </section>
    <section v-ai="{ id: 'How to setup agent' }">
      <h2>2. Setup Agent</h2>
      <p>Next, pass your client function to Agent.</p>
      <pre><code>
import { Agent } from "@browser-ai/ai-expression"
import { openaiClient } from "./openaiClient"

const agent = new Agent(openaiClient)
      </code></pre>
    </section>
    <section v-ai="{ id: 'How to make expression' }">
      <h2>3. Use agent to make a expression</h2>
      <p>
        Finally, you can ask agent to `.check()` the conversation, and ask agent
        some question using NL function `.does()`
      </p>
      <pre><code>
        // 1. Provide the information that you want the agent to assess.
const checkIfUserWantToLogin = async () => {
  agent.check(`
user: Hello
ai: Hello! How can I assist you today ?
user: I want to login
`)
  // 2. Call NL function
  const userWantToLogin = await agent.does("user want to login")
  console.log(userWantToLogin) 
  // Typically, it would be `true`
  if (userWantToLogin) {
    showLoginModal()
  }
  // ...
}
      </code></pre>
      <p>
        `.does()` is one of NL functions. There are other expression: `.is()`,
        `.whichIs()`. For more usage, check the [Agent](./agent)
      </p>
    </section>
  </article>
</template>
<style></style>
