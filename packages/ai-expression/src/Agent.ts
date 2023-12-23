import { Item } from "./Item"
import { Tool, ToolFunctionParams } from "./Tool"
import { AgentEvent } from "./AgentEvent"
import { Prompt } from "./prompt"

export type AgentClient = (message: {
  prompt: string
  systemMessage?: string
}) => Promise<string>

export class Agent {
  public content: string
  public systemMessage: string
  public client: AgentClient
  public event: AgentEvent
  public prompt: Prompt

  constructor(
    client: AgentClient,
    eventName: string = "Event",
    prompt: Prompt = new Prompt(),
  ) {
    this.client = client
    this.content = ""
    this.systemMessage = ""
    this.event = new AgentEvent(eventName)
    this.prompt = prompt
  }

  check(content: string) {
    this.content = content
    return this
  }

  forget() {
    this.content = ""
    return this
  }

  async logic(prompt: string) {
    const message = await this.client({
      prompt,
      systemMessage: this.systemMessage,
    })
    return message
  }

  async yesNo(question: string) {
    return this.choice(question, ["yes", "no"])
  }

  async does(question: string) {
    return this.yesNo(`Does ${question}`)
  }

  async is(question: string) {
    return this.yesNo(`Is ${question}`)
  }

  async choice(question: string, choices: string[]) {
    let message = await this.logic(
      this.prompt.cboice(question, this.content, choices),
    )
    if (!choices.includes(message)) {
      message = await this.correctionByChoice(message, choices)
    }
    return message
  }

  async choices(question: string, choices: string[], max: number = 3) {
    const message = await this.logic(
      this.prompt.cboices(question, this.content, choices, max),
    )
    try {
      const parsed = JSON.parse(message) as string[]
      if (parsed.every((p) => choices.includes(p))) {
        return parsed
      } else {
        throw new Error(`Invalid anwser from agent: ${message}`)
      }
    } catch (e) {
      const correction = await this.correctionToJSON(
        message,
        JSON.stringify(choices),
      )
      try {
        const parsed = JSON.parse(correction) as string[]
        if (parsed.every((p) => choices.includes(p))) {
          return parsed
        } else {
          throw new Error(`Invalid anwser from agent: ${correction}`)
        }
      } catch (e) {
        return []
      }
    }
  }

  async whichOneIs(purpose: string, choices: string[]) {
    return this.choice(`Which one is ${purpose}`, choices)
  }

  async whichOnesAre(purpose: string, choices: string[]) {
    return this.choices(`Which ones are ${purpose}`, choices)
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
    const prompt = this.prompt.pickTool(this.content, tools)

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

  // TODO: make suggestAction prompt not combine like this, it should be decide in prompt.suggestActions()
  async suggestActions(actions: Item[]) {
    const idsString = await this.logic(
      this.prompt.suggestActions(
        this.prompt.event(
          this.event.name,
          this.event.history.map((item) => `${item.event}`).reverse(),
        ),
        actions,
      ),
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
      prompt: this.prompt.correction(wrong, correct),
    })
  }

  async correctionByChoice(wrong: string, choices: string[]) {
    return await this.client({
      prompt: this.prompt.correctionChoice(wrong, choices),
    })
  }

  async correctionToJSON(wrong: string, hint?: string) {
    return await this.client({
      prompt: this.prompt.correctionJSON(wrong, hint),
    })
  }

  async correctionWithSentencesRequired(wrong: string, sentences: string[]) {
    return await this.client({
      prompt: this.prompt.correctionRequiredSentence(wrong, sentences),
    })
  }
}
