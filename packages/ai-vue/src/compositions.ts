import { AgentClient, PageStatus } from "@browser-ai/ai-operators"
import { inject } from "vue"
import { PROVIDE_KEY } from "./constant"
import { CreateAgent } from "./types"
import { RouteStatus } from "./RouteStatus"
import { VueAgent } from "./VueAgent"
import { VueElementStore } from "./vueElementStore"

/** Create Vai with global state with `RouteStatus`, `PageStatus`, `VueElementStore`. Require register plugin first. */
export const createVai = (client: AgentClient) => {
  const createVai = useCreateVai()
  return createVai(client)
}

/**
 * Get global `VueAgent` instance. Require register plugin first. Or will get undefined
 * The global `VueAgent` instance is created by `createVai` with global state with `RouteStatus`, `PageStatus`, `VueElementStore`.
 * */
export const useVai = () => {
  const vai = inject<VueAgent>(PROVIDE_KEY.VAI)
  return vai
}

/**
 * Get global `createVai` function. Require register plugin first.
 * `createVai` use global state with `RouteStatus`, `PageStatus`, `VueElementStore` registered with plugin.
 * */
export const useCreateVai = () => {
  const createVai = inject<CreateAgent>(PROVIDE_KEY.CREATE_VAI)
  if (!createVai) {
    throw new Error("createVai not provided")
  }
  return createVai
}

/** Get global `PageStatus` instance. Require register plugin first. Or get undefined */
export const usePageStatus = () => {
  const pageStatus = inject<PageStatus>(PROVIDE_KEY.PAGE_STATUS)

  return pageStatus
}

/** Get global `RouteStatus` instance. Require register plugin first. Or get undefined */
export const useRouteStatus = () => {
  const routeStatus = inject<RouteStatus>(PROVIDE_KEY.ROUTE_STATUS)

  return routeStatus
}

/** Get global `VueElementStore` instance. Require register plugin first. Or get undefined */
export const useVueElementStore = () => {
  const vueElementStore = inject<VueElementStore>(PROVIDE_KEY.VUE_ELEMENT_STORE)

  return vueElementStore
}
