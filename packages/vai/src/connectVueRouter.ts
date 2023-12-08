import { Router, RouteMeta } from "vue-router"
import { RouteStatus } from "./RouteStatus"

type RouteMetaAI = RouteMeta & {
  ai?: {
    name: string
    description: string
  }
}

export const connectVueRouter = (router: Router) => {
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
        data: r,
      })
    }
  })
  router.afterEach((to) => {
    const meta: RouteMetaAI = to.meta
    if (meta.ai) {
      routeStatus.setCurrentRoute({
        id: meta.ai.name,
        description: meta.ai.description,
        data: to,
      })
    } else {
      routeStatus.unsetCurrentRoute()
    }
  })

  return routeStatus
}
