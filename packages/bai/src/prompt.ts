import { Prompt } from "@browser-ai/ai-expression"
import type { Item } from "@browser-ai/ai-expression"

export class BaiPrompt extends Prompt {
  // TODO: maybe Item should have "type" attribute for determine type para in .items()?
  element(question: string, content: string, elements: Item[]) {
    return this.question(
      question,
      content,
      `Below are available elements. You must answer by only 1 element id from below elements with no other words. If no appropriate element, say 'no', the other agent will navigate user to the place.
${this.items(elements, "Element")}`,
    )
  }

  elements(question: string, content: string, elements: Item[]) {
    return this.question(
      question,
      content,
      `Below are available elements. You must answer by only element ids from below elements with JSON array '["id1", "id2",...]' with no other words, the other agent will navigate user to the place. If no appropriate element, say '[]', 
${this.items(elements, "Element")}`,
    )
  }
}
