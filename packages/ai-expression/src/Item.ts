import { ITEMS as PROMPT_ITEMS } from "./prompt"

export type Item = {
  id: string
  description: string
  data?: Record<string, any>
}

export const computeItemsPrompt = (
  items: Item[],
  type: string = "Item",
): string => {
  return PROMPT_ITEMS(items, type)
}
