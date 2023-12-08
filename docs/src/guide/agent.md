# `Agent`
`Agent` is a class. It offers atomic-level natural language (NL) functions, allowing the straightforward integration of large language model (LLM) capabilities into code evaluations. In addition, it also provides tool functions, enabling you to generate JSON

## `AgentClient`
`Agent` does not possess built-in large language model (LLM) functionality; instead, it requires you to supply an `AgentClient` to facilitate communication with the LLM.

The `AgentClient` is an async function that takes a `prompt` and a `systemMessage` as input. You'll need to call the LLM service and return a `string` in response.

It's important to note that both the prompt and systemMessage passed into the AgentClient should be of type string.

Here is an example:

```ts
import type { AgentClient } from "@browser-ai/ai-expression"
// ./src/openaiClient.ts

// How this function like will depend on your LLM service endpoints

export const chatCompletion = async (payload: any) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    mode: "cors",
    body: JSON.stringify(payload),
  }).then((res) => res.json())

  return response.choices[0].message.content
}

// This is the AgentClient you use to initialize Agent
export const openaiClient: AgentClient = async ({
  prompt,
  systemMessage,
}) => {
  const messages = []
  if (systemMessage) {
    messages.push({
      role: "system",
      content: systemMessage,
    })
  }
  messages.push({
    role: "user",
    content: prompt,
  })
  const message = await chatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages,
  })

  return message as string
}
```

## Init `Agent`
After you setup the `AgentClient`, you can use it to initialize `Agent`.
```ts
import { Agent } from "@browser-ai/ai-expression"
import { openaiClient } from "./openaiClient"

const agent = new Agent(openaiClient)
```

The `Agent` will use the content you provide as judgment material. You need to set the content to be judged before making a judgment. Please use `agent.check()` for configuration.

```ts
agent.check(`
User: Hello
Ai: Hello! How can I assist you today ?
User: I want to login
`)
```

It is important to note that if the content is a conversation, you need to convert them into a format similar to the example above. Actually, there are no restrictions on the format of the content, as long as the input content is a `string`.

```ts
// raw content OK
agent.check("I have 2 apples, 3 banana and 4 organges.")

// any name is OK
agent.check(`
foo: Hello
bar: Hello! How can I assist you today ?
foo: I want to login
Agent: User logged in.
Agent: User picked a product.
`)
```


## Yes or No
You can then execute the NL function, and here we use `.does()`.

```ts
agent.check(`
User: Hello
Ai: Hello! How can I assist you today ?
User: I want to login
`)

const userWantToLogin = await agent.does("user want to login")

console.log(userWantToLogin) // Typically, it would be `true`
```

In this example. If user want to login, `.does()` will return `true`; if user don't want to login, it will return `false`. If agent don't know if user want to login, `.does()` will return `undefined`

So you can easily perform actions based on the result:

```ts
if(userWantToLogin) {
  // do something 
} else {
  // do something
}
```

This type of NL function prompts the language model to respond with either `yes` or `no`, and if unsure, it responds with `none`. The result from the language model's response is then converted into a `boolean` value or left as `undefined`.

A similar function with the same characteristics is `.is()`.

## Semantics
The names of NL functions are indeed auxiliary verbs, indicating differences in vocabulary usage within prompts. The only distinction between the prompts for `.is()` and `.does()` lies in the choice between using **is** or **does** in the prompt.

```ts
// .does(purpose)
`Does ${purpose} ? Answer by "yes" or "no" with no other words. If you dont know, answer "none"`,

// .is(statement)
`Is ${statement} ? Answer by "yes" or "no" with no other words. If you dont know, answer "none"`,
```

Usually, NL functions work in conjunction with your statements to form a complete question. Therefore, you can think of the function name plus your description to determine what statement you need to provide.

```ts
.is("he a boy") // Is he a boy ?
.does("she want to buy something") // Does she want to buy something ?
.whichIs("user's purpose", [ "login", "checkout" ]) // which is user's purpose ? "login", "checkout" ?
```

## Forget
Ask agent `.forget()` the content when the content become useless.

```ts
// set the content to ""
agent.forget()
```

## Choices
Another type of NL function is `.whichIs()`. It selects the most suitable option from the choices you provide. If unsure, it responds with `none`.

It's important to note that, apart from `none`, `.whichIs()` might also return a response that is not among the options you provided.

```ts
agent.check(`
User: Hello
Ai: Hello! How can I assist you today ?
User: I want to login
`)

const purpose = await agent.whichIs("user's purpose", [ "login", "checkout" ] )

switch(purpose){
  case "login":
    // do something
    break
  case "checkout":
    // do something
    break
  default:
    // handle "none" or unexpected result
}
```

## Correction
NL functions come with an automatic correction. If the model's initial response doesn't match the format, it will automatically prompt for a correction. If it still doesn't conform to the format, the original response from the model will be returned.

You can also directly utilize this function.

```ts
const wrong = "Ye"
const correct = "Yes"
await agent.correction(wrong, correct) // typically "Yes"

const wrong: "lo"
const choices = ["login", "checkout"]
await agent.correctionByChoices(wrong, choices) // typically "login"
```

## Event and Suggest Actions 
`Agent` has a method `.suggestActions()`, which can suggest 1 or more actions based on `Event` records. This is useful when suggest next actions to user.

To record the event, use `.recordEvent()`. We can call it multiple times

```ts
agent.recordEvent("User enter the page: Index")
agent.recordEvent("User enter the page: Product")
agent.recordEvent("User click the 'detail' button fo Macbook Pro 13")
agent.recordEvent("User enter the page: Product Detail")
agent.recordEvent("User is viewing Product info Macbook Pro 13")

// will make the record like this
/**
 * 
  User is viewing Product info Macbook Pro 13
  User enter the page: Product Detail
  User click the 'detail' button fo Macbook Pro 13
  User enter the page: Product
  User enter the page: Index
 */
```

After recording, we can ask `Agent` to `.suggestActions()`.

```ts
await agent.suggestActions([
  { id: "login", description: "Login" },
  { id: "register", description: "Register" },
  { id: "addToCart", description: "Add product to cart" },
  { id: "addProductToFavorite", description: "Add product to favorite list" },
])

/**
 * [
 *   { id: "addToCart", description: "Add product to cart" },
 *   { id: "addProductToFavorite", description: "Add product to favorite list" }
 * ]
 */
```

You can also add `data` to your action item for convenience. `data` is a object-literal can contain anything you need.

```ts
await agent.suggestActions([
  // .....
  { id: "addToCart", 
    description: "Add product to cart", 
    data: { 
      action: () => {},
      product: { /** product data */}
      // .....
    } 
  },
  // ...
])

```

:::info
The max record now is `10`. When the 11-th record comes-in, use First in, First out logic to remove record. 
:::

## Tools
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