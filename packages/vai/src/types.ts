import {
  AgentClient,
  TPromptTemplateDiction,
  TPromptTemplate,
} from "@browser-ai/ai-expression"
import { VueAgent } from "./VueAgent"
import { Router } from "vue-router"

export type VaiPluginOptions = Partial<{
  router: Router
}>
export type CreateAgent = (client: AgentClient) => VueAgent

export type TVaiPromptTemplateDiction = TPromptTemplateDiction & {
  WHICH_ROUTE: TPromptTemplate
}
