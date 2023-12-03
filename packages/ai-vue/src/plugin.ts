import { Plugin } from "vue"
import { useVaiDirective } from "./directives"
import { createVueElementStore } from "./vueElementStore"
import { RouteStatus, VueAgent } from "."
import { AgentClient, PageStatus } from "@browser-ai/ai-statements"
import { PROVIDE_KEY } from "./constant"
import { VaiPluginOptions, CreateAgent } from "./types"

export default {
  install(app, options) {
    const vueElementStore = createVueElementStore()
    const pageStatus: PageStatus = options.pageStatus || new PageStatus()
    const routeStatus: RouteStatus = options.routeStatus || new RouteStatus()

    const createVai: CreateAgent = (client: AgentClient) =>
      new VueAgent(client, vueElementStore, pageStatus, routeStatus)

    app.provide(PROVIDE_KEY.CREATE_VAI, createVai)
    app.provide(PROVIDE_KEY.PAGE_STATUS, pageStatus)
    app.provide(PROVIDE_KEY.ROUTE_STATUS, routeStatus)
    app.provide(PROVIDE_KEY.VUE_ELEMENT_STORE, vueElementStore)
    app.directive("ai", useVaiDirective(vueElementStore))

    if (typeof options === "object" && options.client) {
      const vai = createVai(options.client)
      vai.systemMessage = options.systemMessage || ""
      app.provide(PROVIDE_KEY.VAI, vai)
    }
  },
} as Plugin<VaiPluginOptions>
