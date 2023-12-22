type HistoryItem = {
  event: string
  data?: Record<string, any>
}

export class AgentEvent {
  public history: HistoryItem[]
  private size: number
  public name: string

  constructor(name: string, size: number = 10) {
    this.history = []
    this.size = size
    this.name = name
  }

  get last(): HistoryItem | undefined {
    return this.history[this.history.length - 1]
  }

  record(event: string, data?: any): this {
    this.history.push({ event, data })
    if (this.history.length > this.size) {
      this.history.shift()
    }

    return this
  }

  clear(): this {
    this.history = []
    return this
  }
}
