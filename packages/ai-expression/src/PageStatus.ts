export class PageStatus {
  public status: string
  constructor() {
    this.status = ""
  }

  setPageStatus(status: string) {
    this.status = status
  }

  computePrompt(): string {
    return `---Current Page Status---
${this.status}
`
  }
}
