import { AgentClient, PageStatus } from "@browser-ai/ai-expression"
import { inject } from "vue"
import { PROVIDE_KEY } from "./constant"
import { CreateAgent } from "./types"
import { RouteStatus } from "./RouteStatus"
import { VueAgent } from "./VueAgent"
import { VueElementStore } from "./vueElementStore"
import { RouterWaiter } from "./routerWaiter"

/** Create Vai with global state with `RouteStatus`, `PageStatus`, `VueElementStore`. Require register plugin first. */
export const createVai = (client: AgentClient) => {
  const createVai = useCreateVai()
  return createVai(client)
}

/**
 * Get global `VueAgent` instance. Require register plugin first. Or will throw Error
 * The global `VueAgent` instance is created by `createVai` with global state with `RouteStatus`, `PageStatus`, `VueElementStore`.
 * */
export const useVai = () => {
  const vai = inject<VueAgent>(PROVIDE_KEY.VAI)
  if (!vai) {
    throw new Error("vai not provided. You should register plugin first.")
  }
  return vai
}

/**
 * Get global `createVai` function. Require register plugin first.
 * `createVai` use global state with `RouteStatus`, `PageStatus`, `VueElementStore` registered with plugin.
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

/** Get global `VueElementStore` instance. Require register plugin first. Or throw Error */
export const useVueElementStore = () => {
  const vueElementStore = inject<VueElementStore>(PROVIDE_KEY.VUE_ELEMENT_STORE)
  if (!vueElementStore) {
    throw new Error(
      "vueElementStore not provided. You should register plugin first.",
    )
  }

  return vueElementStore
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
