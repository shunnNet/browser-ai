<script setup lang="ts">
import { createVai, Tool } from "@browser-ai/vai"
import { chatgptAgentClient } from "../api/openai"
const vai = createVai(chatgptAgentClient)
const vaiGuider = createVai(chatgptAgentClient)

// TODO: Maybe support one time system message ?
vaiGuider.systemMessage = "請使用中文回答"

const yesNo = async () => {
  await vai.withContext(
    {
      content: "user: My name is John, I want to login",
      systemMessage: "Strictly follow the Instruction below",
    },
    async () => {
      console.log(vai.content)
      console.log(vai.systemMessage)
      await vai.yesNo("Does user want to login?", [
        ["yes", () => console.log("User want to login")],
        ["no", () => console.log("User don't want to login")],
        [() => console.log("We dont know what user want to do")],
      ])
    },
  )
}
const doIs = () => {
  vai
    .check("I want to login")
    .is("User logged in?", [
      ["yes", () => console.log("User want to login")],
      ["no", () => console.log("User don't want to login")],
      [() => console.log("We dont know what user want to do")],
    ])
}

const does = () => {
  vai
    .check("I already login")
    .does("User logged in?", [
      ["yes", () => console.log("User want to login")],
      ["no", () => console.log("User don't want to login")],
      [() => console.log("We dont know what user want to do")],
    ])
}
const whichIs = () => {
  vai
    .check("請問有沒有賣 Iphone 12")
    .whichOneIs("what is user's purpose", [
      ["shopping", () => console.log("I will show you some products")],
      ["login", () => console.log("I will show you login page")],
      [() => console.log("I don't know what user want to do")],
    ])
}
const whichElement = () => {
  vai.check("user: How can i interact with ai?")
  vai.whichElement("can fulfill user's desire").then((res) => console.log(res))
}
const correction = async () => {
  await vai
    .check("請問有沒有賣 Iphone 12")
    .correction("N", `One of "yes", "no" or "__no__" with no any other word.`)
}
const correctionByChoice = async () => {
  await vai
    .check("請問有沒有賣 Iphone 12")
    .correctionByChoice("N", ["no", "yes"])
}

const tool = new Tool(
  (args) => {
    console.log(args)
  },
  {
    name: "extractUserInfo",
    description: "Extract user info from user's message",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
      },
      required: ["name"],
    },
  },
)

const pickTool = async () => {
  const { error, useIt } = await vai
    .check("user: My name is John, I want to login")
    .pickTool([tool])
  if (!error) {
    useIt()
  }
}

const suggestAction = async () => {
  // TODO: llm always return full array to me (ha ha)
  vai
    .recordEvent("User enter the page")
    .recordEvent("User click product card")
    .recordEvent("User enter the product page")
    .suggestActions([
      { id: "login", description: "User login" },
      { id: "shopping", description: "User shopping" },
      { id: "cancel order", description: "User cancel the order" },
      { id: "go to space", description: "User go to space by spaceship" },
    ])
}

const whichItem = async () => {
  vai.withContext(
    `user: I want to buy a phone, Help me login first, then show me the phone you have in your products.
you: I will help you login first.
user: I login already, thankds, please do next step.`,
    async () => {
      const item = await vai.whichItem("Can help user?", [
        // {
        //   id: "login",
        //   description: "A function for user login",
        //   type: "action",
        //   data: {
        //     action: () => console.log("User login"),
        //   },
        // },
        {
          id: "show products",
          description: "A function for showing products",
          type: "action",
          data: {
            action: () => console.log("User shopping"),
          },
        },
        {
          id: "Ai Actions Panel",
          description: "A HTML element which is a panel for showing ai actions",
          type: "element",
        },
      ])
      console.log(item)
    },
  )
}
</script>
<template>
  <div>Index</div>
  <h1 v-ai="{ id: 'title' }">Ai playground</h1>
  <p v-ai="{ id: 'paragraph' }">
    This is a page can play with ai chatbot. You can play with it by the buttons
    below
  </p>
  <div v-ai="{ id: 'actions', description: 'Buttons for interact with ai' }">
    <div>
      <button @click="yesNo">Yes or No</button>
      <button @click="doIs">Is</button>
      <button @click="does">Does</button>
      <button @click="whichIs">WhichIs</button>
      <button @click="whichElement">
        Which element can explain this page?
      </button>
      <button @click="pickTool">PickTool</button>
      <button @click="suggestAction">SuggestAction</button>
    </div>
    <div>
      <button @click="correction">Correction</button>
      <button @click="correctionByChoice">CorrectionByChoice</button>
    </div>
    <div>
      <button @click="whichItem">whichItem</button>
    </div>
  </div>
</template>
<style></style>
