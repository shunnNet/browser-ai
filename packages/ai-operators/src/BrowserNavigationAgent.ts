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
    const id = await this.logic(
      `Which element ${description}? You must answer by only element id with no other words. If no appropriate element, say 'no', and the other agent will navigate user to other place.`,
      this.elementStore.computePrompt(),
    )

    return id && this.elementStore.getElementById(id)
  }

  async whichElements(description: string) {
    const idsString = await this.logic(
      `Which elements ${description}? You must answer by only element ids like JSON array '[1, 2,...]' with no other words. If no appropriate element, say '[]', and the other agent will navigate user to other place.`,
      this.elementStore.computePrompt(),
    )
    try {
      const ids = JSON.parse(idsString) as string[]

      return ids
        .map((id) => this.elementStore.getElementById(id))
        .filter((item) => item)
    } catch (e) {
      return []
    }
  }
}
