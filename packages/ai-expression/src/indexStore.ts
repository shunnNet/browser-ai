import { Item } from "./ItemStore"

export interface IndexStore {
  search(query: string, parameters?: Record<string, any>): Promise<Item[]>
  add(content: string, item: Item): Promise<number[]>
  delete(id: string): Promise<void>
  deleteAll(): Promise<void>
}
