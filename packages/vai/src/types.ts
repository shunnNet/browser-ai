import { AgentClient, Item, VectorStore } from "@browser-ai/bai"
import { Vai } from "./Vai"
import { Router } from "vue-router"
import { VaiPrompt } from "./prompt"

export type VaiPluginOptions = Partial<{
  router: Router
  vectorStore: VectorStore
  itemLayer: {
    base: Item[]
  }
}>
export type CreateAgent = (client: AgentClient, prompt?: VaiPrompt) => Vai
