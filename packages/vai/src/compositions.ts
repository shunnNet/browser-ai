import {
  AgentClient,
  AgentEvent,
  PageStatus,
  ItemStore,
  LayerItemIndex,
  LayerItemStore,
  ItemIndex,
} from "@browser-ai/bai"
import { inject } from "vue"
import { PROVIDE_KEY } from "./constant"
import { CreateAgent } from "./types"
import { RouteStatus } from "./RouteStatus"
import { Vai } from "./Vai"
import { RouterWaiter } from "./routerWaiter"
import { VaiPrompt } from "./prompt"

/** Create Vai with global state with `RouteStatus`, `PageStatus`, `VueItemStore`. Require register plugin first. */
export const createVai = (client: AgentClient, prompt?: VaiPrompt) => {
  const _createVai = useCreateVai()
  return _createVai(client, prompt)
}

/**
 * Get global `Vai` instance. Require register plugin first. Or will throw Error
 * The global `Vai` instance is created by `createVai` with global state with `RouteStatus`, `PageStatus`, `VueItemStore`.
 * */
export const useVai = () => {
  const vai = inject<Vai>(PROVIDE_KEY.VAI)
  if (!vai) {
    throw new Error("vai not provided. You should register plugin first.")
  }
  return vai
}

/**
 * Get global `createVai` function. Require register plugin first.
 * `createVai` use global state with `RouteStatus`, `PageStatus`, `VueItemStore` registered with plugin.
 * */
export const useCreateVai = () => {
  const createVai = inject<CreateAgent>(PROVIDE_KEY.CREATE_VAI)
  if (!createVai) {
    throw new Error("createVai not provided. You should register plugin first.")
  }
  return createVai
}

/** Get global `PageStatus` instance. Require register plugin first. Or throw Error */
export const usePageStatus = () => {
  const pageStatus = inject<PageStatus>(PROVIDE_KEY.PAGE_STATUS)
  if (!pageStatus) {
    throw new Error(
      "pageStatus not provided. You should register plugin first.",
    )
  }

  return pageStatus
}

/** Get global `RouteStatus` instance. Require register plugin first. Or throw Error */
export const useRouteStatus = () => {
  const routeStatus = inject<RouteStatus>(PROVIDE_KEY.ROUTE_STATUS)
  if (!routeStatus) {
    throw new Error(
      "routeStatus not provided. You should register plugin first.",
    )
  }

  return routeStatus
}

/**
 * Get global `VueItemStore` instance. Require register plugin first. Or throw Error
 * VueItemStore only available when you not provide `vectorStore` and `itemLayer.base` option when register plugin.
 * */
export const useVueItemStore = () => {
  const VueItemStore = inject<ItemStore>(PROVIDE_KEY.VUE_ITEM_STORE)
  if (!VueItemStore) {
    throw new Error(
      "VueItemStore not provided. You should register plugin first.",
    )
  }

  return VueItemStore
}

/**
 * Get global `VueItemIndex` instance. Require register plugin first. Or throw Error
 * VueItemIndex only available when you setup `vectorStore` option when register plugin.
 * */
export const useVueItemIndex = () => {
  const store = inject<ItemIndex>(PROVIDE_KEY.LAYER_STORE)
  if (!store) {
    throw new Error(
      "VueItemIndex not provided. You should register plugin first.",
    )
  }

  return store
}

/**
 * Get global `VueLayerItemStore` instance. Require register plugin first. Or throw Error
 * VueLayerItemStore only available when you setup `itemLayer.base` option when register plugin.
 * */
export const useVueLayerItemStore = () => {
  const store = inject<LayerItemStore>(PROVIDE_KEY.LAYER_STORE)
  if (!store) {
    throw new Error(
      "VueLayerItemStore not provided. You should register plugin first.",
    )
  }

  return store
}

/**
 * Get global `VueLayerItemIndex` instance. Require register plugin first. Or throw Error
 * VueLayerItemIndex only available when you setup both `vectorStore` and `itemLayer.base` option when register plugin.
 * */
export const useVueLayerItemIndex = () => {
  const itemIndex = inject<LayerItemIndex>(PROVIDE_KEY.LAYER_INDEX)
  if (!itemIndex) {
    throw new Error(
      "VueLayerItemIndex not provided. You should register plugin first.",
    )
  }

  return itemIndex
}

export const useRouterWaiter = () => {
  const routerWaiter = inject<RouterWaiter>(PROVIDE_KEY.ROUTER_WAITER)
  if (!routerWaiter) {
    throw new Error(
      "RouterWaiter not provided. You should register plugin first.",
    )
  }

  return routerWaiter
}

export const useAgentEvent = () => {
  const agentEvent = inject<AgentEvent>(PROVIDE_KEY.AGENT_EVENT)
  if (!agentEvent) {
    throw new Error(
      "AgentEvent not provided. You should register plugin first.",
    )
  }

  return agentEvent
}
