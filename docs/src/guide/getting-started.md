# Getting Started
To install package via package manager.

```sh
pnpm install @browser-ai/ai-expression
```

### Via **CDN**

```html
<script src="https://unpkg.com/@browser-ai/ai-expression/dist/umd/index.js"></script>
<script>
// Then access all features from `AiExpression`
window.AiExpression
window.AiExpression.Agent
</script>
```

## 1. Setup your client
First, You need to prepare a client that connects to the LLM service. 

The client is an async function that takes a `prompt` and a `systemMessage` as input. You'll need to call the LLM service and return a `string` in response.

Here is a example connect to openai `/chatCompletion` endpoint.

```ts
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
```

## 2. Setup Agent
Next, pass your client function to Agent.

```ts
import { Agent } from "@browser-ai/ai-expression"
import { openaiClient } from "./openaiClient"

const agent = new Agent(openaiClient)
```

## 3. Make expression
Finally, you can ask agent to `.check()` the conversation, and ask agent some question using NL function `.does()`

```ts
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
```


`.does()` is one of NL functions. There are other expression: `.is()`, `.whichIs()`. For more usage, check the [Agent](./agent)
