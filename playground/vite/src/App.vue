<script setup lang="ts">
import { Agent, Tool } from "@browser-ai/ai-operators"
import { chatgptAgentClient } from "./api/openai"
const test = async () => {
  const agent = new Agent(chatgptAgentClient)
  agent.check(`user: I want login`)

  console.log(await agent.does("User want login?"))
}

const tool = new Tool(() => console.log("tool"), {
  name: "login",
  description: "Useful when user want to login.",
  parameters: {
    type: "object",
    required: ["name", "password", "email"],
    properties: {
      name: {
        type: "string",
        description: "User's name",
      },
      password: {
        type: "string",
        description: "User's password",
      },

      email: {
        type: "string",
        description: "User's email",
      },
    },
  },
  additionalProperties: false,
})

const useTools = async () => {
  const agent = new Agent(chatgptAgentClient)
  agent.check(`user: I want to login`)
  const result = await agent.useTools([tool])
  console.log(result)
}
</script>

<template>
  <button @click="test">Test</button>
  <button @click="useTools">UseTools</button>
</template>
