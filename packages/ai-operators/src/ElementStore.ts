export type ElementStoreItem = {
  id: string
  description: string
}

export class ElementStore<T extends ElementStoreItem> {
  public elements: Record<string, T>
  constructor() {
    this.elements = {}
  }

  computePrompt(): string {
    return Object.values(this.elements)
      .map((item, i) => {
        return `---Element ${i + 1}---        
Id: ${item.id}
Description: ${item.description}
`
      })
      .join("\n\n")
  }

  getElementById(id: string): T {
    return this.elements[id]
  }

  setElementById(id: string, item: T): ElementStore<T> {
    this.elements[id] = item

    return this
  }

  deleteElementById(id: string): ElementStore<T> {
    delete this.elements[id]

    return this
  }
}
