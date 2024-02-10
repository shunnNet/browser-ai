<script setup lang="ts">
import { useCreateVai } from "@browser-ai/vai"
import { chatgptAgentClient } from "../api/openai"
import { ref } from "vue"

const createVai = useCreateVai()
const vai = createVai(chatgptAgentClient)
const userMessage = "I am looking for a job, my name is John"
const question = "Which is user's purpose ?"
const r = ref("")
const showJobList = ref(false)
const test = () => {
  vai.withContext(userMessage, async () => {
    const result = await vai.chooseAndAnswer({
      "Looking for a job": {
        questions: ["user name", "user email", "user phone"],
        handler: (r) => {
          console.log("r", r)
          return r
        },
      },
      "Playing a game": {
        questions: ["game name", "user's age"],
        handler: (r) => {
          console.log("r", r)
          return r
        },
      },
      fallback: () => {
        console.log("fallback")
      },
    })
    console.log("result", result)
  })
}
</script>
<template>
  <h1 class="text-2xl">Choice</h1>
  <div class="test-block grid gap-3">
    <div class="test-block-title">Choice</div>
    <div>userMessage: {{ userMessage }}</div>
    <div>question: {{ question }}</div>
    <div>response: {{ r }}</div>
    <button @click="test">Test</button>

    <div v-if="showJobList">
      <div>Job List</div>
      <div>Job 1</div>
      <div>Job 2</div>
      <div>Job 3</div>
    </div>
  </div>
</template>
<style></style>
