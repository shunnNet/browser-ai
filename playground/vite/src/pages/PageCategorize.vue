<script setup lang="ts">
import { useCreateVai } from "@browser-ai/vai"
import { chatgptAgentClient } from "../api/openai"
import { ref } from "vue"

const createVai = useCreateVai()
const vai = createVai(chatgptAgentClient)
const userMessage = "n"
const question = "Which is user's purpose ?"
const r = ref("")
const showJobList = ref(false)
const test = () => {
  vai.withContext(userMessage, async () => {
    const result = await vai.categorize(question, {
      p: [
        [
          "a",
          () => {
            showJobList.value = true
            return "I found some job opportunities for you"
          },
        ],
        [
          "c",
          () => {
            showJobList.value = true
            return "I found some job opportunities for you"
          },
        ],
        () => "Category Choices Default: I don't know what he want to do",
      ],
      // "Car related": ["Buying a car", "He want to buy a car now, really ?"],
      // "House related": [
      //   "Renting a house",
      //   () => {
      //     return "Maybe he want to rent a house first ?"
      //   },
      // ],
      fallback: () => "Category Default: I don't know what he want to do",
    })
    r.value = result
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
