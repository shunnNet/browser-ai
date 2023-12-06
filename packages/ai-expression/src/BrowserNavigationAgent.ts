import { Agent, AgentClient } from "./Agent"
import { ElementStore, ElementStoreItem } from "./ElementStore"
import { PageStatus } from "./PageStatus"

export class BrowserNavigationAgent extends Agent {
  public elementStore: ElementStore<ElementStoreItem>
  public pageStatus: PageStatus

  static create(client: AgentClient) {
    return new BrowserNavigationAgent(
      client,
      new ElementStore(),
      new PageStatus(),
    )
  }

  constructor(
    client: AgentClient,
    elementStore: ElementStore<ElementStoreItem>,
    pageStatus: PageStatus,
  ) {
    super(client)
    this.elementStore = elementStore
    this.pageStatus = pageStatus
  }
  async whichElement(description: string) {
    let id = await this.logic(
      `Which element ${description}? You must answer by only element id with no other words. If no appropriate element, say 'no', and the other agent will navigate user to other place.`,
      this.elementStore.computePrompt(),
    )
    if (!this.elementStore.getElementById(id) && id !== "no") {
      id = await this.correctionByChoices(
        id,
        this.elementStore.getElementIds().concat("no"),
      )
    }

    return id && this.elementStore.getElementById(id)
  }

  async whichElements(description: string) {
    const idsString = await this.logic(
      `Which elements ${description}? You must answer by only element ids like JSON array '["id1", "id2",...]' with no other words. If no appropriate element, say '[]', and the other agent will navigate user to other place.`,
      this.elementStore.computePrompt(),
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
      (ele) => {
        if (ele.dataset.aiId) {
          this.elementStore.setElementById(ele.dataset.aiId, {
            id: ele.dataset.aiId,
            description: ele.dataset.aiDescription || ele.textContent || "",
          })
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
  async explainThisPage(reason?: string) {
    const result = await this.logic(
      `Explain this page ${reason ? "for " + reason : ""}`,
      this.pageStatus.computePrompt() +
        "\n" +
        this.elementStore.computePrompt(),
    )
    return result
  }
}
