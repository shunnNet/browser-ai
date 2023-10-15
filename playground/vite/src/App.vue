<script setup lang="ts">
import { Agent } from "@browser-ai/ai-operators"
import { chatgptAgentClient } from "./api/openai"
const test = async () => {
  const agent = new Agent(chatgptAgentClient)
  agent.check("user: I want login")

  console.log(await agent.does("User want login?"))
}
</script>

<template>
  <button @click="test">Test</button>
</template>
