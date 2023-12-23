import { ElementStore, ElementStoreItem } from "./ElementStore"
import { PageStatus } from "./PageStatus"
import { Agent, Prompt } from "@browser-ai/ai-expression"
import type { AgentClient } from "@browser-ai/ai-expression"
import { BaiPrompt } from "./prompt"

type DOMElementStoreItem = ElementStoreItem & {
  el: HTMLElement
}

export class Bai<
  T extends DOMElementStoreItem = DOMElementStoreItem,
> extends Agent {
  public elementStore: ElementStore<T>
  public pageStatus: PageStatus
  public prompt: BaiPrompt = new BaiPrompt()

  static create(
    client: AgentClient,
    eventName: string = "Event",
    promptTemplate?: BaiPrompt,
  ) {
    return new Bai(
      client,
      eventName,
      new ElementStore<DOMElementStoreItem>(),
      new PageStatus(),
      promptTemplate,
    )
  }

  constructor(
    client: AgentClient,
    eventName: string,
    elementStore: ElementStore<T>,
    pageStatus: PageStatus,
    prompt?: Prompt,
  ) {
    super(client, eventName, prompt)
    this.elementStore = elementStore
    this.pageStatus = pageStatus
  }
  async whichElement(description: string) {
    let id = await this.logic(
      this.prompt.element(
        `which element ${description}`,
        this.content,
        Object.values(this.elementStore.elements),
      ),
    )
    if (!this.elementStore.getElementById(id) && id !== "no") {
      id = await this.correctionByChoice(
        id,
        this.elementStore.getElementIds().concat("no"),
      )
    }

    return id && this.elementStore.getElementById(id)
  }

  async whichElements(description: string) {
    const idsString = await this.logic(
      this.prompt.elements(
        description,
        this.content,
        Object(this.elementStore.elements).values(),
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

    return ids
      .map((id) => this.elementStore.getElementById(id))
      .filter((item) => item)
  }

  collect() {
    Array.from(document.querySelectorAll<HTMLElement>(`[data-ai-id]`)).forEach(
      (el) => {
        // TODO: remove "as T"
        if (el.dataset.aiId) {
          this.elementStore.setElementById(el.dataset.aiId, {
            id: el.dataset.aiId,
            description: el.dataset.aiDescription || el.textContent || "",
            el,
          } as T)
        }
      },
    )
    return this
  }

  drop() {
    this.elementStore.deleteAllElements()
    return this
  }

  /** TODO: In Beta */
  // async explainThisPage(reason?: string) {
  //   const result = await this.logic(
  //     `Explain this page ${reason ? "for " + reason : ""}`,
  //     this.pageStatus.computePrompt() +
  //       "\n" +
  //       this.elementStore.computePrompt(),
  //   )
  //   return result
  // }
}
