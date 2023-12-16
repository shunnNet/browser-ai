<script setup lang="ts">
import { createVai } from "@browser-ai/vai"
import { chatgptAgentClient } from "../api/openai"

const vai = createVai(chatgptAgentClient)
const vaiGuider = createVai(chatgptAgentClient)

// TODO: Maybe support one time system message ?
vaiGuider.systemMessage = "請使用中文回答"

const doIs = () => {
  vai.is("User is logged in").then((res) => {
    console.log("Ai response:", res)
  })
}
const whichElement = () => {
  vai.whichElement("can play with ai chatbot").then((res) => console.log(res))
}

const explainThisPage = () => {
  vaiGuider
    .explainThisPage("Introduce the page for user first enter this page")
    .then((res) => console.log(res))
}
</script>
<template>
  <div>Index</div>
  <h1 v-ai="{ id: 'title' }">Chatbot playground</h1>
  <p v-ai="{ id: 'paragraph' }">
    This is a page can play with ai chatbot. You can play with it by the buttons
    below
  </p>
  <div v-ai="{ id: 'actions', description: 'Buttons for interact with ai' }">
    <button @click="doIs">Is</button>
    <button @click="whichElement">Which element can explain this page?</button>
    <button @click="explainThisPage">Explain this page.</button>
  </div>
</template>
<style></style>
