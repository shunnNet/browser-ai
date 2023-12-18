import {
  BrowserNavigationAgent,
  AgentClient,
  PageStatus,
  AgentEvent,
} from "@browser-ai/ai-expression"
import { VueElementStore, VueElementStoreItem } from "./vueElementStore"
import { RouteStatus, Route } from "./RouteStatus"
import {
  computeFormatHint,
  ComponentOption,
} from "@crazydos/vue-llm-rich-message"
import { WHICH_ROUTE } from "./prompt"
import type { TVaiPromptTemplateDiction } from "./types"

export class VueAgent extends BrowserNavigationAgent<VueElementStoreItem> {
  protected routeStatus: RouteStatus

  constructor(
    client: AgentClient,
    elementStore: VueElementStore,
    pageStatus: PageStatus,
    routeStatus: RouteStatus,
    agentEvent?: AgentEvent,
    promptTemplate: Partial<TVaiPromptTemplateDiction> = {},
  ) {
    super(client, "Event", elementStore, pageStatus, {
      WHICH_ROUTE,
      ...promptTemplate,
    })
    this.routeStatus = routeStatus
    this.event = agentEvent || this.event
  }

  async whichRoute(description: string): Promise<Route | undefined> {
    let id = await this.logic(
      this.promptTemplate.WHICH_ROUTE(description),
      this.routeStatus.computeRoutesPrompt(),
    )
    if (!this.routeStatus.getRouteById(id)) {
      id = await this.correctionByChoices(id, this.routeStatus.getRouteIds())
    }

    return id ? this.routeStatus.getRouteById(id) : undefined
  }

  computeComponentFormatHint(components: ComponentOption | ComponentOption[]) {
    return computeFormatHint(components)
  }
}
