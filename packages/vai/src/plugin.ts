import { Plugin } from "vue"
import { useVaiDirective } from "./directives"
import { createVueItemStore } from "./vueItemStore"
import { Vai } from "./Vai"
import { RouteStatus } from "./RouteStatus"
import { AgentEvent, PageStatus } from "@browser-ai/bai"
import { connectVueRouter } from "./connectVueRouter"
import { PROVIDE_KEY } from "./constant"
import { VaiPluginOptions, CreateAgent } from "./types"
import { createRouterWaiter } from "./routerWaiter"

export default {
  install(app, options = {}) {
    if (options.itemIndex) {
      app.provide(PROVIDE_KEY.VUE_ITEM_INDEX, options.itemIndex)
      app.directive("ai", useVaiDirective(options.itemIndex))
    } else {
      const vueItemStore = createVueItemStore()
      app.provide(PROVIDE_KEY.VUE_ITEM_STORE, vueItemStore)
      app.directive("ai", useVaiDirective(vueItemStore))
    }

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
      new Vai(
        client,
        pageStatus,
        routeStatus as RouteStatus,
        agentEvent,
        prompt,
      )
    app.provide(PROVIDE_KEY.CREATE_VAI, createVai)
    app.provide(PROVIDE_KEY.PAGE_STATUS, pageStatus)
  },
} as Plugin<VaiPluginOptions>
