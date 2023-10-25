import { Agent, AgentClient } from "./Agent"
import { ElementStore, ElementStoreItem } from "./ElementStore"
import { PageStatus } from "./PageStatus"

export class BrowserNavigationAgent<T extends ElementStoreItem> extends Agent {
  public elementStore: ElementStore<T>
  public pageStatus: PageStatus
  constructor(
    client: AgentClient,
    elementStore: ElementStore<T>,
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
    if (!this.elementStore.getElementById(id)) {
      id = await this.correctionByChoices(id, this.elementStore.getElementIds())
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
}
