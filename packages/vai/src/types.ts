import { AgentClient, PageStatus } from "@browser-ai/ai-expression"
import { VueAgent } from "./VueAgent"
import { Router } from "vue-router"

export type VaiPluginOptions = Partial<{
  router: Router
  client: AgentClient
  systemMessage: string
  pageStatus: PageStatus
}>
export type CreateAgent = (client: AgentClient) => VueAgent
