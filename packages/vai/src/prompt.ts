import { Prompt } from "@browser-ai/ai-expression"
import type { Route } from "./RouteStatus"

export function WHICH_ROUTE(description: string) {
  return `Which route ${description}? You must answer by only route id with no other words. If no appropriate route, say 'no', and the other agent will navigate user to other place.`
}

export class VaiPrompt extends Prompt {
  whichRoute(question: string, content: string, routes: Route[]) {
    return this.question(
      question,
      content,
      `Below are available page. You must answer by only 1 page id from below pages with no other words, the other agent will navigate user to the place. If no appropriate page, say "${
        this.none
      }", 
${this.items(routes, "Page")}`,
    )
  }
}
