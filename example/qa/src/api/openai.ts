import { openaiClient } from "./fetch"
import { AgentClient } from "@browser-ai/ai-expression"

export type OpenAIMessage = {
  role: "user" | "system" | "function" | "assistant"
  content: string
  name?: string
}

export const chatCompletion = async (payload: any) => {
  const response = await openaiClient("/chat/completions").post(payload).json()

  return {
    message:
      response.data.value && response.data.value.choices[0].message.content,
    choices: response.data.value && response.data.value.choices,
    func:
      response.data.value &&
      response.data.value.choices[0].message.function_call &&
      response.data.value.choices[0].message.function_call.name,
    args:
      response.data.value &&
      response.data.value.choices[0].message.function_call &&
      JSON.parse(
        response.data.value.choices[0].message.function_call.arguments,
      ),
  }
}

export const chatgptAgentClient: AgentClient = async ({
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
  console.log(prompt)
  messages.push({
    role: "user",
    content: prompt,
  })
  const { message } = await chatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages,
  })
  console.log(message)

  return message as string
}
