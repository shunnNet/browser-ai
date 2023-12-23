import { AgentClient } from "@browser-ai/bai"
import { VueAgent } from "./VueAgent"
import { Router } from "vue-router"
import { VaiPrompt } from "./prompt"

export type VaiPluginOptions = Partial<{
  router: Router
}>
export type CreateAgent = (client: AgentClient, prompt?: VaiPrompt) => VueAgent
