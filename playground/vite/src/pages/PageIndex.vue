<script setup lang="ts">
import { useCreateVai } from "@browser-ai/vai"
import { chatgptAgentClient } from "../api/openai"

const createVai = useCreateVai()
const vai = createVai(chatgptAgentClient)
const userMessage = "I am looking for a job"
const test = async () => {
  await vai.withContext(
    { content: userMessage, systemMessage: "" },
    async () => {
      console.log("context 1", vai.content)
      console.log("context 1", vai.systemMessage)
      await vai.withContext(
        { content: "context 2" + userMessage, systemMessage: "context 2" },
        async () => {
          console.log("context 2", vai.content)
          console.log("context 2", vai.systemMessage)
        },
      )
      console.log("context 1 after", vai.content)
      console.log("context 1 after", vai.systemMessage)
    },
  )

  console.log("end", vai.content)
  console.log("end", vai.systemMessage)
}
</script>
<template>
  <h1 class="text-2xl">Index</h1>
  <div class="test-block">
    <div class="test-block-title">withContext</div>
    <button @click="test">Test</button>
  </div>
</template>
<style></style>
