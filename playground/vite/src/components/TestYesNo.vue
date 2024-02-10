<script setup lang="ts">
import { useCreateVai } from "@browser-ai/vai"
import { chatgptAgentClient } from "../api/openai"
import { ref } from "vue"

const createVai = useCreateVai()
const vai = createVai(chatgptAgentClient)
const userMessage = "I am looking for a job"
const r = ref(false)
const test = () => {
  vai.withContext(userMessage, async () => {
    const result = await vai.yesNo(
      "Does user want to looking for new job opportunities?",
    )
    r.value = result
  })
}
</script>
<template>
  <div class="test-block">
    <div class="test-block-title">YesNo</div>
    <div>userMessage: {{ userMessage }}</div>
    <div>question: Does user want to looking for new job opportunities?</div>
    <div>r: {{ r }}</div>
    <button @click="test">Test</button>
  </div>
</template>
<style></style>
