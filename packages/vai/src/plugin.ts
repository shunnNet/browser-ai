import { Plugin } from "vue"
import { useVaiDirective } from "./directives"
import { createVueElementStore } from "./vueElementStore"
import { RouteStatus, VueAgent } from "."
import { AgentClient, PageStatus } from "@browser-ai/ai-expression"
import { connectVueRouter } from "./connectVueRouter"
import { PROVIDE_KEY } from "./constant"
import { VaiPluginOptions, CreateAgent } from "./types"
import { createRouterWaiter } from "./routerWaiter"

export default {
  install(app, options) {
    const vueElementStore = createVueElementStore()
    const pageStatus = new PageStatus()

    let routeStatus: RouteStatus | null = null
    if (options.router) {
      routeStatus = connectVueRouter(options.router)
      const routerWaiter = createRouterWaiter(options.router)
      app.provide(PROVIDE_KEY.ROUTER_WAITER, routerWaiter)
    } else {
      routeStatus = new RouteStatus()
    }
    app.provide(PROVIDE_KEY.ROUTE_STATUS, routeStatus)

    const createVai: CreateAgent = (client: AgentClient) =>
      new VueAgent(
        client,
        vueElementStore,
        pageStatus,
        routeStatus as RouteStatus,
      )

    app.provide(PROVIDE_KEY.CREATE_VAI, createVai)
    app.provide(PROVIDE_KEY.PAGE_STATUS, pageStatus)
    app.provide(PROVIDE_KEY.VUE_ELEMENT_STORE, vueElementStore)
    app.directive("ai", useVaiDirective(vueElementStore))
  },
} as Plugin<VaiPluginOptions>
