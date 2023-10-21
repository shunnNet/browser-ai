import {
  BrowserNavigationAgent,
  AgentClient,
  PageStatus,
} from "@browser-ai/ai-operators"
import { vueElementStore, VueElementStoreItem } from "./vueElementStore"
import { RouteStatus, Route } from "./RouteStatus"

export class VueAgent extends BrowserNavigationAgent<VueElementStoreItem> {
  protected routeStatus: RouteStatus
  constructor(
    client: AgentClient,
    elementStore: typeof vueElementStore,
    pageStatus: PageStatus,
    routeStatus: RouteStatus,
  ) {
    super(client, elementStore, pageStatus)
    this.routeStatus = routeStatus
  }

  async whichRouteIs(description: string): Promise<Route | undefined> {
    const id = await this.logic(
      `Which route is ${description}? You must answer by only route id with no other words. If no appropriate element, say 'no', and the other agent will navigate user to other place.`,
      this.routeStatus.computeRoutesPrompt(),
    )

    return id ? this.routeStatus.getRouteById(id) : undefined
  }
}
