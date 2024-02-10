<script setup lang="ts">
import { useCreateVai } from "@browser-ai/vai"
import { chatgptAgentClient } from "../api/openai"
import { ref } from "vue"

const createVai = useCreateVai()
const vai = createVai(chatgptAgentClient)
const userMessage = "I am looking for a job"
const question = "Which is user's purpose ?"
const r = ref("")
const showJobList = ref(false)
const handleByString = () => {
  vai.withContext("I want to see Naruto", async () => {
    const result = await vai.choice(question, [
      "Looking for a job",
      "Buying a car",
      "Renting a house",
      // Run when "I dont know" or "Other answer"
      // () => "I don't know what he want to do",
    ])
    if (result === "Looking for a job") {
      showJobList.value = true
    }
    console.log("result", result)
    r.value = result
  })
}
const handleByFunc = () => {
  vai.withContext(userMessage, async () => {
    const result = await vai.choice(question, [
      [
        "Looking for a job",
        () => {
          showJobList.value = true
          return "I found some job opportunities for you"
        },
      ],
      ["Buying a car", "He want to buy a car now, really ?"],
      [
        "Renting a house",
        () => {
          return "Maybe he want to rent a house first ?"
        },
      ],
      // Run when "I dont know" or "Other answer"
      () => "I don't know what he want to do",
    ])
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
    <button @click="handleByFunc">handleByFunc</button>
    <button @click="handleByString">handleByString</button>

    <div v-if="showJobList">
      <div>Job List</div>
      <div>Job 1</div>
      <div>Job 2</div>
      <div>Job 3</div>
    </div>
  </div>
</template>
<style></style>
