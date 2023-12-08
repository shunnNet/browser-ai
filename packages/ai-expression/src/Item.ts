export type Item = {
  id: string
  description: string
  data?: Record<string, any>
}

export const computeItemsPrompt = (
  items: Item[],
  type: string = "Item",
): string => {
  return items
    .map((item) => {
      return `---${type} id:${item.id}---
Name: ${item.id}
Description: ${item.description}
`
    })
    .join("\n\n")
}
