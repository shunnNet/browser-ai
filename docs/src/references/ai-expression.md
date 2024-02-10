## agent.withContext
```ts
(message: string | {
    content: string;
    systemMessage: string;
}, func: () => any): Promise<any>
```
`withContext` 可以傳入一段訊息、函式，當傳入 `withContext` 的函式結束時，`agent` 的 `content` 以及 `systemMessage` 就會回復到呼叫 `withContext`。

這在想要避免不同的 prompt 互相影響的時候，可以發揮作用。

```ts
agent.content = "No message"

await agent.withContext(`A: I want to buy something.`, async () => {
  console.log(agent.content) // "A: I want to buy something."
  
  await agent.yesNo("Does user want to check product ?")
  // ...do something with current context
})

console.log(agent.content) // "No message"
```

你也可以同時傳入 `systemMessage`。

```ts
agent.systemMessage = ""

await agent.withContext({
  content: `A: I want to buy something.`,
  systemMessage: "You are a customer service"
}, async () => {
  console.log(agent.systemMessage) // You are a customer service
  // ...do something with current context
})
```

在 `withContext` 中，也可以使用 `withContext`。

```ts
agent.content = "No message"

await agent.withContext(`A: I want to buy something.`, async () => {
  console.log(agent.content) // "A: I want to buy something."
  console.log(agent.systemMessage) // ""
  
  await agent.withContext({
    content: `A: I want to buy something.`,
    systemMessage: "You are a customer service, help user find the products he/she want."
  }, async () => {
    console.log(agent.content) // "A: I want to buy something."
    console.log(agent.systemMessage) // "You are a customer service, help user find the products he/she want."
  })

  console.log(agent.content) // "A: I want to buy something."
  console.log(agent.systemMessage) // ""
})

console.log(agent.content) // "No message"
```

## agent.choice
```ts
Agent.choice(question: string, choices: AgentChoice[]): Promise<any>

type AgentChoice =
  | string
  | [string, () => any]
  | [string, any]
  | ((...args: any) => any)
```
choice 可以提出一個問題，並提供可回答的選項，讓 model 只從中挑選回答。

```ts
agent.withContext("User: I want to find a job", async ()=> {
  const purpose = await agent.choice("Which is user's purpose ?", [
    "Looking for a job",
    "Buying a car",
    "Renting a house"
  ])
  console.log(purpose) // "Looking for a job"
})


```

你也可以直接傳入 handler function，當那個選項被回答時可以執行

```ts

const purpose = await agent.choice("Which is user's purpose ?", [
  ["Looking for a job", () => { console.log(/* .... */) }],
  "Buying a car",
  "Renting a house"
])

console.log(purpose) // "Looking for a job"
```

handler function 的回傳內容會直接成為 choice 的回傳內容。因此，實際上可以把前面的例子看成：

```ts
const purpose = await agent.choice("Which is user's purpose ?", [
  ["Looking for a job", () => "Looking for a job"],
  ["Buying a car", () => "Buying a car"]
  ["Renting a house", () => "Renting a house"]
])

console.log(purpose) // "Looking for a job"
```

### handler behaviour
choice 根據 handler 的類型不同會有不同的回傳值

```ts
[
  ["Looking for a job", () => "Looking for a job"], // return "Looking for a job"
  ["Buying a car", true]                            // return true
  ["Renting a house"]                               // return "Renting a house"
  "Renting a house"                                 // return "Renting a house"
]
```

### handle "I don't know" or others...
當 model 回答選項以外的答案時(e.g I don't know)，在預設的情況下，會回傳 `null`

```ts
agent.withContext("User: I want to see Naruto !", async ()=> {
  const purpose = await agent.choice("Which is user's purpose ?", [
    "Looking for a job",
    "Buying a car",
    "Renting a house"
  ])
  console.log(purpose) // null
})
```

但是你也可以傳入 handler 處理這種情況：
```ts
agent.withContext("User: I want to see Naruto !", async ()=> {
  const purpose = await agent.choice("Which is user's purpose ?", [
    "Looking for a job",
    "Buying a car",
    "Renting a house",
    () => "I don't know"
  ])
  console.log(purpose) // "I don't know"
})
```


## agent.yesNo
```ts
(method) Agent.yesNo(question: string, choices?: AgentChoice[]): Promise<any>
```
這是一種 [`choice`](#agentchoice) 的變形，他只會回答 yes/no，你需要提出一個是或否的問題。
當 model 回傳 yes 時，會回傳 `true`，反之則是 `false`

```ts
vai.withContext("I am looking for a job", async () => {
  const result = await vai.yesNo(
    "Does user want to looking for new job opportunities?",
  )
  console.log(result) // true
})
```

你可以透過提供選項改變預設的行為：

```ts
vai.withContext("I am looking for a job", async () => {
  const result = await vai.yesNo(
    "Does user want to looking for new job opportunities?",
    ["yes", () => "Find a job"],
    ["no", () => "Do nothing"],
  )
  console.log(result) // "Find a job"
})
```

與 `choice` 相同，你也可以提供 "I don't know" 的 handler

```ts
vai.withContext("XXXX", async () => {
  const result = await vai.yesNo(
    "Does user want to looking for new job opportunities?",
    [
      ["yes", () => "Find a job"],
      ["no", () => "Do nothing"],
      () => "handle by I don't know",
    ]
  )
  console.log(result) // "handle by I don't know"
})
```

## agent.does
```ts
(method) Agent.does(question: string, choices?: AgentChoice[]): Promise<any>
```

`does` 是一種 [`yesNo`](#agentyesno) 的糖，只是會在傳入的 question 加上 `Does` prefix。

```ts
// These 2 are the same
agent.yesNo("Does user want to looking for new job opportunities?")
agent.does("user want to looking for new job opportunities?")
```

## agent.is
```ts
(method) Agent.is(question: string, choices?: AgentChoice[]): Promise<any>
```

`is` 是一種 [`yesNo`](#agentyesno) 的糖，只是會在傳入的 question 加上 `Is` prefix。

```ts
// These 2 are the same
agent.yesNo("Is user a member ?")
agent.is("user a memeber")
```

## agent.whichOneIs
```ts
(method) Agent.whichOneIs(purpose: string, choices: AgentChoice[]): Promise<any>
```

`whichOneIs` 是一種 [`choice`](#agentchoice) 的糖，只是會在傳入的 question 加上 `Which one is` prefix。

```ts
// These 2 are the same
agent.choice("Which one is user's purpose ?")
agent.whichOneIs("user's purpose ?")
```

## agent.choices
## agent.whichOnesAre

## agent.categorize
```ts
(method) Agent.categorize(question: string, categories: ([string, AgentChoice[]] | (() => any))[]): Promise<any>
```
`categorize` 可以減少呼叫 model 的次數，並且可以處理主題更多樣的情況。

`categorize` 在 [`choice`](#agentchoice) 之上再加入一層分類，實際上在背後使用這樣的 prompt

```md
Question: how to use job filter?

- job
  - searching a job
  - asking question about job filter
  - has trouble with finding a job

- resume
  - asking a problem about resume editor
  - asking a problem about tip of writing a resume
```

model 會先將輸入分類為 job 或是 resume，然後在從中選擇一個選項。

將以上的結構換成 categorize 則可以表示為

```ts
const result = await agent.categorize(
  "how to use job filter?",
  {
    "job": [
      "searching a job", 
      "asking question about job filter", 
      "has trouble with finding a job"
    ],
    "resume": [
      "asking a problem about resume editor",
      "asking a problem about tip of writing a resume",
    ]
  }
)

console.log(result) // ["job", "asking question about job filter"]
```

categorize 的子分類其實跟 [`choice`](#agentchoice) 的參數一樣，可以傳入 `AgentChoice`，因此也可以傳入 handler。

```ts
const result = await agent.categorize(
  "how to use job filter?",
  {
    "job": [
      ["searching a job", async () => { /** handle the situation */ }], 
      ["asking question about job filter", () => true ], 
      "has trouble with finding a job"  
      () => "handle I dont know"
    ],
    // ...
  }
)

console.log(result) // value returned by handler
```


## agent.chooseAndAnswer
```ts
(method) Agent.chooseAndAnswer(questionGroups: Record<string, {
    questions: string[];
    handler?: ((args: any[]) => any) | undefined;
}> & {
    fallback?: (() => any) | undefined;
}): Promise<any>
```

`chooseAndAnswer` 會要求 model 先選擇一組分類，然後回答分類底下的所有問題。

```ts
agent.withContext("I am looking for a job, my name is John", async () => {
  const result = await agent.chooseAndAnswer({
    "Looking for a job": {
      questions: ["user name", "user email", "user phone"],
      // handler is optional, chooseAndAnswer will directly return [question, answer1, answer2, ...] when handler is not provided 
      handler: async ([question, answer1, answer2, answer3]) => {
        
        console.log("r", [question, answer1, answer2, answer3])
        // ['Looking for a job', 'John', '', '']

        
        return [question, answer1, answer2, answer3]
      },
    },
    // ....
  })

  console.log(result) // ['Looking for a job', 'John', '', '']
})
```

同時，也可以提供 fallback handler 處理沒有任何合適的分類時的狀況：


```ts
agent.withContext("I am looking for a job, my name is John", async () => {
  const result = await agent.chooseAndAnswer({
    // omit...
    
    fallback: () => {
      // handle I don't know...
    }
    // ....
  })
})
```


## agent.whichItem
## agent.pickTool
```ts
(method) Agent.pickTool(tools: Tool<any>[]): Promise<{
    func: string;
    args: ToolFunctionParams;
    useIt: () => any;
    error?: string | undefined;
}>

```

When you need the `Agent` to dynamically generate JSON content, you can use `Tool`.

The concept of `Tool` involves representing the name of a function, its description, and the structure of its parameters using [JSON Schema](https://json-schema.org/). Subsequently, the language model will generate corresponding function parameters based on the schema, in other words, it generates JSON. You can pass this JSON into a function call or use the JSON data directly.

Typical scenarios for using Tool include:

- Needing to generate different field data in one go based on the content.
- Providing natural language parameters to a function, such as prompt messages, for a more lively interaction.
- Dynamically choosing a function and executing it at runtime.

```ts
import { Tool } from "@browser-ai/ai-expression"

const tool = new Tool(
  ({ message }) => {
    console.log(message)
    return message
  },
  {
    name: "welcome",
    description: "Welcome user to use this chatbot",
    parameters: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The message to welcome user",
        },
      },
    },
    required: ["message"],
  },
)
```

Once you've created a Tool, you can then pass it into `agent.pickTool()`.

```ts
agent.check(`
User: Hello
`)

const { error, useIt, func, args } = await agent.pickTool([tool])
// func => function name to invoke
// args => function args

if (!error) {
  useIt() // invoke tool function with parameter
  // typically will log "Hello! How can I assist you today"
}
```

The args should be an `object-literal` with any key-value.

The error will be string if Model response with invalid JSON format, or not match to the schema, or tool [validate](#validate) function return `false`.

You can also pass in multiple tools, and the `Agent` will choose an appropriate one that fits the conversation context.

```ts
// Agent will pick one of these tools
const result = await agent.pickTool([
  showMessageTool,
  guideUserTool,
])
```

:::warning
`.pickTool()` does not support auto correction currently.
:::

### validate
You can pass your validation function to validate Model response.

It accept a `args` object with any key with value.

Please return `true` when it is valid, or `useTool()` will failed with error message.

Here is its signature:

```ts


const tool = new Tool(
  /** tool function */,
  /** tool schema */,

  // validate
  // type ToolValidateFunction = (args: Record<string, any>) => boolean
  (args) => {
    return typeof args.name === 'string' && args.name.length > 3
  }
)

```

### type the tool function
It is possible to define `args` type and return type use `generics`

```ts
const tool = new Tool<{ message: string }, string>(
  ({ message }) => {
    return "should be string"
  }
)
```
