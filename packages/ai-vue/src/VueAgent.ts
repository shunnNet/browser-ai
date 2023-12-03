import {
  BrowserNavigationAgent,
  AgentClient,
  PageStatus,
} from "@browser-ai/ai-statements"
import { VueElementStore, VueElementStoreItem } from "./vueElementStore"
import { RouteStatus, Route } from "./RouteStatus"
import {
  computeFormatHint,
  ComponentOption,
} from "@crazydos/vue-llm-rich-message"

export class VueAgent extends BrowserNavigationAgent<VueElementStoreItem> {
  protected routeStatus: RouteStatus

  constructor(
    client: AgentClient,
    elementStore: VueElementStore,
    pageStatus: PageStatus,
    routeStatus: RouteStatus,
  ) {
    super(client, elementStore, pageStatus)
    this.routeStatus = routeStatus
  }

  async whichRoute(description: string): Promise<Route | undefined> {
    let id = await this.logic(
      `Which route ${description}? You must answer by only route id with no other words. If no appropriate route, say 'no', and the other agent will navigate user to other place.`,
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
