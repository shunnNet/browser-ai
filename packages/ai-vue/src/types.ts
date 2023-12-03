import { AgentClient, PageStatus } from "@browser-ai/ai-statements"
import { VueAgent } from "./VueAgent"
import { RouteStatus } from "."

export type VaiPluginOptions = Partial<{
  routeStatus: RouteStatus
  client: AgentClient
  systemMessage: string
  pageStatus: PageStatus
}>
export type CreateAgent = (client: AgentClient) => VueAgent
