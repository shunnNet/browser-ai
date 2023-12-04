import { Router, RouteMeta } from "vue-router"
import { RouteStatus } from "./RouteStatus"

type RouteMetaAI = RouteMeta & {
  ai?: {
    title: string
    description: string
  }
}

export const connectVueRouter = (router: Router) => {
  const routeStatus = new RouteStatus()

  router.getRoutes().forEach((r) => {
    const meta: RouteMetaAI = r.meta
    if (typeof r.name === "string" && meta.ai) {
      routeStatus.addRoute({
        id: r.name,
        title: meta.ai.title,
        description: meta.ai.description,
      })
    }
  })
  router.afterEach((to) => {
    const meta: RouteMetaAI = to.meta
    if (typeof to.name === "string" && meta.ai) {
      routeStatus.setCurrentRoute({
        id: to.name,
        title: meta.ai.title,
        description: meta.ai.description,
      })
    }
  })

  return routeStatus
}
