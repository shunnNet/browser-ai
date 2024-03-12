import { Item, ItemStore } from "./ItemStore"
import { Tool, ToolFunctionParams } from "./Tool"
import { AgentEvent } from "./AgentEvent"
import { Prompt } from "./prompt"

export interface AgentClient {
  expression(message: {
    prompt: string
    systemMessage?: string
  }): Promise<string>

  chat(message: string, options?: Record<string, any>): any
}

export type AgentChoice =
  | string
  | [string, () => any]
  | [string, any]
  | ((...args: any) => any)

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

  async withContext(
    message: string | { content: string; systemMessage: string },
    func: () => any,
  ): Promise<any> {
    const _originalContent = this.content
    const _originalSystemMessage = this.systemMessage
    const _content = typeof message === "string" ? message : message.content
    const _sm =
      typeof message === "string"
        ? _originalSystemMessage
        : message.systemMessage

    this.check(_content)
    this.systemMessage = _sm
    try {
      await func()
    } catch (e) {
      this.check(_originalContent)
      this.systemMessage = _originalSystemMessage
      throw e
    }

    this.check(_originalContent)
    this.systemMessage = _originalSystemMessage
  }

  async logic(prompt: string) {
    const message = await this.client.expression({
      prompt,
      systemMessage: this.systemMessage,
    })
    return message
  }

  async yesNo(question: string, choices?: AgentChoice[]) {
    const validChoices = ["yes", "no"]
    let _choices: AgentChoice[] = [
      ["yes", true],
      ["no", false],
    ]

    // TODO: this is a mess, need to refactor
    if (Array.isArray(choices)) {
      const check = []
      for (const c of choices) {
        if (typeof c === "string") {
          if (validChoices.includes(c)) {
            check.push(c)
          } else {
            throw new Error("yesNo choices must be 'yes' or 'no', got " + c)
          }
        }
        if (Array.isArray(c) && typeof c[0] !== "function") {
          if (validChoices.includes(c[0])) {
            check.push(c[0])
          } else {
            throw new Error("yesNo choices must be 'yes' or 'no', got " + c[0])
          }
        }
      }
      if (check.includes("yes") && check.includes("no")) {
        _choices = choices
      } else {
        throw new Error(
          "yesNo choices must include 'yes' or 'no', got " + check,
        )
      }
    }

    return this.choice(question, _choices)
  }

  async does(question: string, choices?: AgentChoice[]) {
    return this.yesNo(`Does ${question}`, choices)
  }

  async is(question: string, choices?: AgentChoice[]) {
    return this.yesNo(`Is ${question}`, choices)
  }

  async choice(question: string, choices: AgentChoice[]) {
    let _default: () => any = () => null
    const _collection: Record<string, () => any> = {}
    for (const c of choices) {
      if (typeof c === "string") {
        _collection[c] = () => c
      }
      if (typeof c === "function") {
        _default = c
      }
      if (Array.isArray(c) && typeof c[0] === "string") {
        if (typeof c[1] === "function") {
          _collection[c[0]] = c[1]
        } else if (c.length > 1) {
          _collection[c[0]] = () => c[1] as any
        }
      }
    }
    const _choices = Object.keys(_collection)

    let message = await this.logic(
      this.prompt.cboice(question, this.content, _choices),
    )

    if (!_choices.concat(this.prompt.none).includes(message)) {
      message = await this.correctionByChoice(message, _choices)
    }
    return message in _collection ? _collection[message]() : _default()
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

  async whichOneIs(purpose: string, choices: AgentChoice[]) {
    return this.choice(`Which one is ${purpose}`, choices)
  }

  async whichOnesAre(purpose: string, choices: string[]) {
    return this.choices(`Which ones are ${purpose}`, choices)
  }

  async categorize(
    question: string,
    categories: Record<string, AgentChoice[] | (() => any)> & {
      fallback?: () => any
    },
  ) {
    let _default: any = () => null
    const diction: Record<string, Record<string, any>> = {}
    const _normalizedCategories = []

    for (const [categoryName, choices] of Object.entries(categories)) {
      if (categoryName === "fallback") {
        _default = categories.fallback
        continue
      }

      const categoryStrategies: Record<string, any> = (diction[categoryName] =
        {})
      const _normalized: [string, string[]] = [categoryName, []]

      for (const item of choices as AgentChoice[]) {
        if (typeof item === "string") {
          categoryStrategies[item] = (r: any) => r
          _normalized[1].push(item)
        } else if (typeof item === "function") {
          _default = item
          categoryStrategies["_default"] = item
        } else if (Array.isArray(item) && typeof item[0] === "string") {
          if (typeof item[1] === "function") {
            categoryStrategies[item[0]] = item[1]
            _normalized[1].push(item[0])
          } else if (item.length > 1) {
            categoryStrategies[item[0]] = () => item[1] as any
          }
        }
      }
      _normalizedCategories.push(_normalized)
    }
    const prompt = this.prompt.categrorize(
      question,
      this.content,
      _normalizedCategories,
    )
    const message = await this.logic(prompt)
    let payload: any = []
    try {
      payload = JSON.parse(message)
      if (!payload.length) {
        throw new Error("I dont know")
      }
    } catch (e) {
      return _default()
    }
    const [primary, secondary] = payload

    if (!diction[primary]) {
      return _default()
    } else if (typeof diction[primary][secondary] !== "function") {
      return diction[primary]["_default"]?.() || _default()
    } else {
      return diction[primary][secondary](payload)
    }
  }

  async chooseAndAnswer(
    questionGroups: Record<
      string,
      { questions: string[]; handler?: (args: any[]) => any } | (() => any)
    > & { fallback?: () => any },
  ) {
    const _normalized: any[] = []
    let _default = () => null
    const _handlerMap: Record<string, (args: string[]) => any> = {}
    for (const [category, content] of Object.entries(questionGroups)) {
      if (category === "fallback") {
        _default = content as () => any
      } else {
        const { questions, handler } = content as {
          questions: string[]
          handler?: (args: any[]) => any
        }
        _normalized.push([category, questions])
        _handlerMap[category] = handler || ((r) => r)
      }
    }

    const prompt = this.prompt.chooseAndAnswer(this.content, _normalized)
    const message = await this.logic(prompt)
    let result: string[] = []
    try {
      result = JSON.parse(message)
    } catch (e) {
      return _default()
    }
    if (_handlerMap[result[0]]) {
      return _handlerMap[result[0]](result)
    } else {
      return _default()
    }
  }

  // TODO: Not good when repeat, but one time may work
  async whichItem(question: string, itemStore: ItemStore, name?: string) {
    const message = await this.logic(
      this.prompt.whichItem(
        question,
        this.content,
        itemStore.getAllItems(),
        name,
      ),
    )
    return itemStore.getItemById(message)
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

    const response = await this.client.expression({ prompt })
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
  // TODO: llm always return full array to me (laugh)
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
    return await this.client.expression({
      prompt: this.prompt.correction(wrong, correct),
    })
  }

  async correctionByChoice(wrong: string, choices: string[]) {
    return await this.client.expression({
      prompt: this.prompt.correctionChoice(wrong, choices),
    })
  }

  async correctionToJSON(wrong: string, hint?: string) {
    return await this.client.expression({
      prompt: this.prompt.correctionJSON(wrong, hint),
    })
  }

  async correctionWithSentencesRequired(wrong: string, sentences: string[]) {
    return await this.client.expression({
      prompt: this.prompt.correctionRequiredSentence(wrong, sentences),
    })
  }

  chat(message: string, options?: Record<string, any>) {
    return this.client.chat(message, options)
  }
}
