import { Item, computeItemsPrompt } from "./Item"
import { Tool, ToolFunctionParams } from "./Tool"
import { AgentEvent } from "./AgentEvent"

export type AgentClient = (message: {
  prompt: string
  systemMessage?: string
}) => Promise<string>

export class Agent {
  public content: string
  public systemMessage: string
  public client: AgentClient
  public event: AgentEvent

  constructor(client: AgentClient, eventName: string = "Event") {
    this.client = client
    this.content = ""
    this.systemMessage = ""
    this.event = new AgentEvent(eventName)
  }

  check(content: string) {
    this.content = content
    return this
  }

  forget() {
    this.content = ""
    return this
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
    let message = await this.logic(
      `Does ${purpose} ? Answer by "yes" or "no" with no other words. If you dont know, answer "none"`,
    )
    const choices = ["yes", "no", "none"]
    if (!choices.includes(message)) {
      message = await this.correctionByChoices(message, choices)
    }

    if (message === "yes") {
      return true
    } else if (message === "no") {
      return false
    } else {
      return
    }
  }
  async is(statement: string) {
    let message = await this.logic(
      `Is ${statement} ? Answer by "yes" or "no" with no other words. If you dont know, answer "none"`,
    )

    const choices = ["yes", "no", "none"]
    if (!choices.includes(message)) {
      message = await this.correctionByChoices(message, choices)
    }

    if (message === "yes") {
      return true
    } else if (message === "no") {
      return false
    } else {
      return
    }
  }

  async whichIs(purpose: string, choices: string[]) {
    let message = await this.logic(
      `Which one is ${purpose} ? You must answer with one of these: ${choices
        .map((c) => `"${c}"`)
        .join(",")} with no other words. If you don't know, anwser "none"`,
    )
    const _choices = choices.concat("none")
    if (!_choices.includes(message)) {
      message = await this.correctionByChoices(message, _choices)
    }

    return message
  }

  async pickTool(tools: Tool<any>[]) {
    const result: {
      func: string
      args: ToolFunctionParams
      useIt: () => any
      error?: string
    } = {
      func: "",
      args: {},
      useIt: () => {},
      error: undefined,
    }
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
  "func": <function-name-to-be-call>
  "args": <function-args>
}`
    const response = await this.client({ prompt })
    try {
      const parsed = JSON.parse(response) as {
        func: unknown
        args: unknown
      }
      const selectedTool = tools.find((t) => t.name === parsed.func)

      if (
        typeof parsed.func === "string" &&
        selectedTool &&
        parsed.args &&
        typeof parsed.args === "object" &&
        !Array.isArray(parsed.args) &&
        selectedTool.validate(parsed.args)
      ) {
        result.func = parsed.func
        result.args = parsed.args
        result.useIt = () => selectedTool.func(result.args)
        return result
      } else {
        throw new Error(`Invalid anwser from agent: ${response}`)
      }
    } catch (e) {
      result.error = e instanceof Error ? e.message : "Unknown Error"
      return result
    }
  }

  recordEvent(event: string, data: Record<string, any> = {}): this {
    this.event.record(event, data)
    return this
  }

  clearEvent(): this {
    this.event.clear()
    return this
  }

  async suggestActions(actions: Item[]) {
    const idsString = await this.logic(
      `Which actions may user takes next? You must answer by only action ids like JSON array '["id1", "id2",...]' with no other words. If no appropriate action, say '[]', and we will not make any suggestion to user.`,
      `${this.event.prompt}

${computeItemsPrompt(actions, "Action")}
`,
    )
    let ids: string[] = []
    try {
      ids = JSON.parse(idsString) as string[]
    } catch (e) {
      const correction = await this.correctionToJSON(
        idsString,
        '["id1", "id2"]',
      )
      try {
        ids = JSON.parse(correction) as string[]
      } catch (e) {
        ids = []
      }
    }
    return ids.flatMap((id) => actions.find((a) => a.id === id) || [])
  }

  async correction(wrong: string, correct: string) {
    return await this.client({
      prompt: `You gave an answer with wrong format, I need you correct the answer to the correct format with no other words.

---previous anwser---
${wrong}

---correct format---
${correct}

---anwser with correct format---

`,
    })
  }

  async correctionByChoices(wrong: string, choices: string[]) {
    return this.correction(
      wrong,
      `Anwser with one of the following item with no other words:
${choices.join("\n")}`,
    )
  }

  async correctionToJSON(wrong: string, hint?: string) {
    let correct = "The answer should be valid JSON with no other words"
    if (hint) {
      correct += `
---example---
${hint}`
    }

    return this.correction(wrong, correct)
  }

  async correctionWithSentencesRequired(wrong: string, sentences: string[]) {
    return await this.client({
      prompt: `You gave an unexpected answer, the anwser should include 1 or more sentences. I need you fill in the sentences to the previous answer in appropriate place, or fix it if the sentence in anwser is broken, with no change to other part of anwser.

---previous anwser---
${wrong}

---sentences you need fill in(1 or more)---
${sentences.join("\n")}

---anwser with correct format---

`,
    })
  }
}
