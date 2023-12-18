import { Item, computeItemsPrompt } from "./Item"
import { Tool, ToolFunctionParams } from "./Tool"
import { AgentEvent } from "./AgentEvent"
import * as PROMPT from "./prompt"
import { TPromptTemplateDiction } from "./types"

export type AgentClient = (message: {
  prompt: string
  systemMessage?: string
}) => Promise<string>

export class Agent {
  public content: string
  public systemMessage: string
  public client: AgentClient
  public event: AgentEvent
  protected promptTemplate: TPromptTemplateDiction

  constructor(
    client: AgentClient,
    eventName: string = "Event",
    promptTemplate: Partial<TPromptTemplateDiction> = {},
  ) {
    this.client = client
    this.content = ""
    this.systemMessage = ""
    this.event = new AgentEvent(eventName)
    this.promptTemplate = { ...PROMPT, ...promptTemplate }
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
    return this.promptTemplate.BASE(logicMessage, this.content, appendix)
  }

  async logic(logicMessage: string, appendix?: string) {
    const message = await this.client({
      prompt: this.computePrompt(logicMessage, appendix),
      systemMessage: this.systemMessage,
    })
    return message
  }

  async does(purpose: string) {
    let message = await this.logic(this.promptTemplate.YES_NO(purpose, "Does"))
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
    let message = await this.logic(this.promptTemplate.YES_NO(statement, "Is"))

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
      this.promptTemplate.CHOICES(purpose, choices),
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
    const prompt = this.promptTemplate.PICK_TOOL(this.content, tools)

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
    // TODO: maybe is not a good idea to customize like this ?

    const idsString = await this.logic(
      this.promptTemplate.SUGGEST_ACTIONS(),
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
      prompt: this.promptTemplate.CORRECTION(wrong, correct),
    })
  }

  async correctionByChoices(wrong: string, choices: string[]) {
    return await this.client({
      prompt: this.promptTemplate.CORRECTION_CHOICES(wrong, choices),
    })
  }

  async correctionToJSON(wrong: string, hint?: string) {
    return await this.client({
      prompt: this.promptTemplate.CORRECTION_JSON(wrong, hint),
    })
  }

  async correctionWithSentencesRequired(wrong: string, sentences: string[]) {
    return await this.client({
      prompt: this.promptTemplate.CORRECTION_REQUIRED_SENTENCES(
        wrong,
        sentences,
      ),
    })
  }
}
