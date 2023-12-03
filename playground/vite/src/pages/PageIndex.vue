<script setup lang="ts">
import { useVai } from "@browser-ai/ai-vue"

const vai = useVai()
vai.check("User is logged in")
const doIs = () => {
  vai.is("User is logged in").then((res) => {
    console.log("Ai response:", res)
  })
}
</script>
<template>
  <div>Index</div>
  <button @click="doIs">Is</button>
</template>
<style></style>
