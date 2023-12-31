import { Bai, AgentClient, PageStatus, AgentEvent } from "@browser-ai/bai"
import { RouteStatus, Route } from "./RouteStatus"
import {
  computeFormatHint,
  ComponentOption,
} from "@crazydos/vue-llm-rich-message"
import { VaiPrompt } from "./prompt"

export class Vai extends Bai {
  protected routeStatus: RouteStatus
  public prompt: VaiPrompt = new VaiPrompt()

  constructor(
    client: AgentClient,
    pageStatus: PageStatus,
    routeStatus: RouteStatus,
    agentEvent?: AgentEvent,
    prompt?: VaiPrompt,
  ) {
    super(client, "Event", pageStatus, prompt)
    this.routeStatus = routeStatus
    this.event = agentEvent || this.event
  }

  async whichRoute(description: string): Promise<Route | undefined> {
    let id = await this.logic(
      this.prompt.whichRoute(
        description,
        this.content,
        this.routeStatus.routes,
      ),
    )
    if (!this.routeStatus.getRouteById(id)) {
      id = await this.correctionByChoice(id, this.routeStatus.getRouteIds())
    }

    return id ? this.routeStatus.getRouteById(id) : undefined
  }

  computeComponentFormatHint(components: ComponentOption | ComponentOption[]) {
    return computeFormatHint(components)
  }
}
