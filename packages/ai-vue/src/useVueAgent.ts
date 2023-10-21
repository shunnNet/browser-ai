import { AgentClient, PageStatus } from "@browser-ai/ai-operators"
import { VueAgent } from "./VueAgent"
import { vueElementStore } from "./vueElementStore"
import { routeStatus } from "./RouteStatus"

const pageStatus = new PageStatus()

export const useVueAgent = (client: AgentClient) => {
  const agent = new VueAgent(client, vueElementStore, pageStatus, routeStatus)

  return agent
}
