import { Tool } from "./Tool"

export type AgentClient = (message: {
  prompt: string
  systemMessage?: string
}) => Promise<string>

export class Agent {
  public content: string
  public systemMessage: string
  public client: AgentClient

  constructor(client: AgentClient) {
    this.client = client
    this.content = ""
    this.systemMessage = ""
  }

  check(content: string) {
    this.content = content
  }

  computePrompt(logicMessage: string, appendix?: string) {
    return `I need you anwser the question based on following content. ${logicMessage}

---content---
${this.content}

${appendix || ""}

---your anwser---

`
  }

  async logic(logicMessage: string, appendix?: string) {
    const message = await this.client({
      prompt: this.computePrompt(logicMessage, appendix),
      systemMessage: this.systemMessage,
    })
    return message
  }

  async does(purpose: string) {
    const message = await this.logic(
      `Does ${purpose} ? Answer by "yes" or "no" with no other words. If you dont know, answer "none"`,
    )

    if (message === "yes") {
      return true
    } else if (message === "no") {
      return false
    } else {
      return
    }
  }
  async is(statement: string) {
    const message = await this.logic(
      `Is ${statement} ? Answer by "yes" or "no" with no other words. If you dont know, answer "none"`,
    )

    if (message === "yes") {
      return true
    } else if (message === "no") {
      return false
    } else {
      return
    }
  }

  async whichIs(purpose: string, choices: string[]) {
    const message = await this.logic(
      `Which one is ${purpose} ? You must answer with one of these: ${choices
        .map((c) => `"${c}"`)
        .join(",")} with no other words. If you don't know, anwser "none"`,
    )

    return message
  }

  async useTools(tools: Tool[]) {
    const functionPrompts = tools
      .map((t, index) => {
        return `---function ${index + 1}---
Function name: ${t.name}
Function JSON Schema: ${JSON.stringify(t.schema)}
`
      })
      .join("\n\n")
    const prompt = `I need you choose 1 function and pass args for fulfill the request based on following content. You MUST follow the JSON Schema to pass args to function.
  
---question---

---content---
${this.content}

${functionPrompts}

---your anwser---
{
  "function": <function-name-to-be-call>
  "args": <function-args>
}`
    const message = await this.client({ prompt })
    try {
      return JSON.parse(message)
    } catch (e) {
      if (e instanceof Error) {
        return { error: e.message }
      } else {
        return { error: "Unknown Error" }
      }
    }
    return message
  }
}
