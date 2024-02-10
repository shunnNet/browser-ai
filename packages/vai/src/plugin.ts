import { Plugin } from "vue"
import { useVaiDirective } from "./directives"
import { Vai } from "./Vai"
import { RouteStatus } from "./RouteStatus"
import {
  AgentEvent,
  PageStatus,
  ItemStore,
  LayerItemIndex,
  LayerItemStore,
  ItemIndex,
} from "@browser-ai/bai"
import { connectVueRouter } from "./connectVueRouter"
import { PROVIDE_KEY } from "./constant"
import { VaiPluginOptions, CreateAgent } from "./types"
import { createRouterWaiter } from "./routerWaiter"

export default {
  install(app, options = {}) {
    if (Array.isArray(options.itemLayer?.base)) {
      if (options.vectorStore) {
        const layerItemIndex = new LayerItemIndex(options.vectorStore)
        const vueItemStore = new ItemStore()
        const userItemStore = new ItemStore()
        layerItemIndex.addLayer("base", new ItemStore(options.itemLayer.base))
        layerItemIndex.addLayer("vai", vueItemStore)
        layerItemIndex.addLayer("default", userItemStore)
        app.provide(PROVIDE_KEY.LAYER_INDEX, layerItemIndex)
        app.directive("ai", useVaiDirective(vueItemStore))
      } else {
        const layerItemStore = new LayerItemStore()
        const vueItemStore = new ItemStore()
        const userItemStore = new ItemStore()
        layerItemStore.addLayer("base", new ItemStore(options.itemLayer.base))
        layerItemStore.addLayer("vai", vueItemStore)
        layerItemStore.addLayer("user", userItemStore)
        app.provide(PROVIDE_KEY.LAYER_STORE, layerItemStore)
        app.directive("ai", useVaiDirective(vueItemStore))
      }
    } else {
      if (options.vectorStore) {
        const vueItemIndex = new ItemIndex(options.vectorStore)
        app.provide(PROVIDE_KEY.VUE_ITEM_INDEX, vueItemIndex)
        app.directive("ai", useVaiDirective(vueItemIndex))
      } else {
        const vueItemStore = new ItemStore()
        app.provide(PROVIDE_KEY.VUE_ITEM_STORE, vueItemStore)
        app.directive("ai", useVaiDirective(vueItemStore))
      }
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
