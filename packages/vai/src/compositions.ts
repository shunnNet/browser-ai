import { AgentClient, AgentEvent, PageStatus } from "@browser-ai/bai"
import { inject } from "vue"
import { PROVIDE_KEY } from "./constant"
import { CreateAgent } from "./types"
import { RouteStatus } from "./RouteStatus"
import { Vai } from "./Vai"
import { VueItemStore } from "./vueItemStore"
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

/** Get global `VueItemStore` instance. Require register plugin first. Or throw Error */
export const useVueItemStore = () => {
  const VueItemStore = inject<VueItemStore>(PROVIDE_KEY.VUE_ITEM_STORE)
  if (!VueItemStore) {
    throw new Error(
      "VueItemStore not provided. You should register plugin first.",
    )
  }

  return VueItemStore
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
