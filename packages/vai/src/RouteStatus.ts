import { Item } from "@browser-ai/ai-expression"

export type Route = Item

export class RouteStatus {
  public routes: Route[]
  protected wait: Promise<any>
  public currentPageRoute: Route | null

  constructor() {
    this.currentPageRoute = null
    this.routes = []
    this.wait = Promise.resolve()
  }

  computeCurrentPagePrompt() {
    return this.currentPageRoute
      ? `---current page content---
Page: ${this.currentPageRoute.id}
Description: ${this.currentPageRoute.description}
`
      : ""
  }

  setCurrentRoute(route: Route) {
    this.currentPageRoute = route
  }

  unsetCurrentRoute() {
    this.currentPageRoute = null
  }

  addRoute(route: Route) {
    this.routes.push(route)
    return this
  }
  removeRoute(id: string) {
    const index = this.routes.findIndex((r) => r.id === id)
    if (index > -1) {
      this.routes.splice(index, 1)
    }

    return this
  }

  getRouteById(id: string) {
    return this.routes.find((route) => route.id === id)
  }

  getRouteIds() {
    return this.routes.map((r) => r.id)
  }
}
