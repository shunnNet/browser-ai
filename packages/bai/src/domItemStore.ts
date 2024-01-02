import { ItemStore } from "@browser-ai/ai-expression"
import type { Item } from "@browser-ai/ai-expression"

export type DOMItem = Item & {
  type: "HTMLElement"
  data: {
    el: HTMLElement
  } & Record<string, any>
}

// TODO: utilize dom handling
export class DOMItemStore extends ItemStore<DOMItem> {
  createDOMItem(
    id: string,
    description: string,
    data: DOMItem["data"],
  ): DOMItem {
    return this.createItem(id, description, "HTMLElement", data) as DOMItem
  }
  collect() {
    Array.from(document.querySelectorAll<HTMLElement>(`[data-ai-id]`)).forEach(
      (el) => {
        if (!el.dataset.aiId) {
          return
        }
        this.setItemById(el.dataset.aiId, {
          id: el.dataset.aiId,
          type: "HTMLElement",
          description: el.dataset.aiDescription || el.textContent || "",
          data: { el },
        })
      },
    )
    return this
  }
}
