import { Plugin } from "vue"
import { useVaiDirective } from "./directives"
import { createVueElementStore } from "./vueElementStore"
import { RouteStatus, VueAgent } from "."
import { AgentEvent, PageStatus } from "@browser-ai/bai"
import { connectVueRouter } from "./connectVueRouter"
import { PROVIDE_KEY } from "./constant"
import { VaiPluginOptions, CreateAgent } from "./types"
import { createRouterWaiter } from "./routerWaiter"

export default {
  install(app, options = {}) {
    const vueElementStore = createVueElementStore()
    const pageStatus = new PageStatus()
    const agentEvent = new AgentEvent("Event")

    let routeStatus: RouteStatus | null = null
    if (options.router) {
      routeStatus = connectVueRouter(options.router, agentEvent)
      const routerWaiter = createRouterWaiter(options.router)
      app.provide(PROVIDE_KEY.ROUTER_WAITER, routerWaiter)
    } else {
      routeStatus = new RouteStatus()
    }
    app.provide(PROVIDE_KEY.ROUTE_STATUS, routeStatus)

    const createVai: CreateAgent = (client, prompt) =>
      new VueAgent(
        client,
        vueElementStore,
        pageStatus,
        routeStatus as RouteStatus,
        agentEvent,
        prompt,
      )
    app.provide(PROVIDE_KEY.CREATE_VAI, createVai)
    app.provide(PROVIDE_KEY.PAGE_STATUS, pageStatus)
    app.provide(PROVIDE_KEY.VUE_ELEMENT_STORE, vueElementStore)
    app.directive("ai", useVaiDirective(vueElementStore))
  },
} as Plugin<VaiPluginOptions>
