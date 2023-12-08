import { Item, computeItemsPrompt } from "./Item"

export type ElementStoreItem = Pick<Item, "id" | "description">

export class ElementStore<T extends ElementStoreItem = ElementStoreItem> {
  public elements: Record<string, T>
  constructor() {
    this.elements = {}
  }

  computePrompt(): string {
    return computeItemsPrompt(Object.values(this.elements), "Element")
  }

  getElementIds() {
    return Object.keys(this.elements)
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

  deleteAllElements() {
    Object.keys(this.elements).forEach((id) => {
      this.deleteElementById(id)
    })
  }
}
