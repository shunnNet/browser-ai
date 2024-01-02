import { PageStatus } from "./PageStatus"
import { Agent, Prompt, ItemStore } from "@browser-ai/ai-expression"
import type { AgentClient } from "@browser-ai/ai-expression"
import { BaiPrompt } from "./prompt"

export class Bai extends Agent {
  public pageStatus: PageStatus
  public prompt: BaiPrompt = new BaiPrompt()

  static create(
    client: AgentClient,
    eventName: string = "Event",
    promptTemplate?: BaiPrompt,
  ) {
    return new Bai(client, eventName, new PageStatus(), promptTemplate)
  }

  constructor(
    client: AgentClient,
    eventName: string,
    pageStatus: PageStatus,
    prompt?: Prompt,
  ) {
    super(client, eventName, prompt)
    this.pageStatus = pageStatus
  }
  async whichElement(description: string, itemStore: ItemStore) {
    let id = await this.logic(
      this.prompt.element(
        `which element ${description}`,
        this.content,
        itemStore.getAllItems(),
      ),
    )
    // TODO: replace "no" with I_DONT_KNOW
    if (!itemStore.getItemById(id) && id !== "no") {
      id = await this.correctionByChoice(
        id,
        itemStore.getItemIds().concat("no"),
      )
    }

    return id && itemStore.getItemById(id)
  }

  async whichElements(description: string, itemStore: ItemStore) {
    const idsString = await this.logic(
      this.prompt.elements(description, this.content, itemStore.getAllItems()),
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

    return ids.map((id) => itemStore.getItemById(id)).filter((item) => item)
  }

  /** TODO: In Beta */
  // async explainThisPage(reason?: string) {
  //   const result = await this.logic(
  //     `Explain this page ${reason ? "for " + reason : ""}`,
  //     this.pageStatus.computePrompt() +
  //       "\n" +
  //       itemStore.computePrompt(),
  //   )
  //   return result
  // }
}
