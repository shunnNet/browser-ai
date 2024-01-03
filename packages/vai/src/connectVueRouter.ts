import { Router, RouteMeta } from "vue-router"
import { RouteStatus } from "./RouteStatus"
import { AgentEvent } from "@browser-ai/bai"

type RouteMetaAI = RouteMeta & {
  ai?: {
    name: string
    description: string
  }
}

export const connectVueRouter = (router: Router, event: AgentEvent) => {
  const routeStatus = new RouteStatus()

  router.getRoutes().forEach((r) => {
    const meta: RouteMetaAI = r.meta
    if (meta.ai) {
      if (!(meta.ai.name && meta.ai.description)) {
        throw new Error(`Missing AI name or description for route: ${r.path}`)
      }
      routeStatus.addRoute({
        id: meta.ai.name,
        description: meta.ai.description,
        type: "Route",
        data: r,
      })
    }
  })
  router.afterEach((to) => {
    const meta: RouteMetaAI = to.meta
    let pageName = ""
    if (meta.ai) {
      routeStatus.setCurrentRoute({
        id: meta.ai.name,
        description: meta.ai.description,
        type: "Route",
        data: to,
      })
      pageName = meta.ai.name
    } else {
      routeStatus.unsetCurrentRoute()
      pageName = to.name?.toString() || to.path
    }

    if (pageName && event) {
      event.record(`User enter the page: ${pageName}`)
    }
  })

  return routeStatus
}
