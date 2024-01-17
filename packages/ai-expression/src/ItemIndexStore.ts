import { Item, ItemManipulator, ItemStore } from "./ItemStore"
import { IndexStore } from "./indexStore"

export class ItemIndexStore implements ItemManipulator {
  public indexStore: IndexStore
  public itemStore: ItemStore
  constructor(itemStore: ItemStore, indexStore: IndexStore) {
    this.indexStore = indexStore
    this.itemStore = itemStore
  }

  search(query: string, parameters?: Record<string, any>): Promise<Item[]> {
    return this.indexStore.search(query, parameters)
  }

  async setItemById(id: string, item: Item) {
    this.itemStore.setItemById(id, item)
    await this.indexStore.add(item.description, item)
  }

  async deleteItemById(id: string) {
    this.itemStore.deleteItemById(id)
    await this.indexStore.delete(id)
  }

  async deleteAllItems() {
    this.itemStore.deleteAllItems()
    await this.indexStore.deleteAll()
  }

  getAllItems() {
    return this.itemStore.getAllItems()
  }

  getItemIds() {
    return this.itemStore.getItemIds()
  }

  getItemById(id: string) {
    return this.itemStore.getItemById(id)
  }
}
