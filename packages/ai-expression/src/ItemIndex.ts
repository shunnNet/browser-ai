import { ItemStore, LayerItemStore, Item } from "./ItemStore"

export interface VectorStore {
  upsert(id: string, item: Item): Promise<void>
  upsertMany(items: Item[]): Promise<void>
  delete(id: string): Promise<void>
  deleteMany(ids: string[]): Promise<void>
}

export class ItemIndex extends ItemStore {
  public index: VectorStore
  constructor(index: VectorStore) {
    super()
    this.index = index
  }

  async setItemById(id: string, item: Item) {
    super.setItemById(id, item)
    await this.index.upsert(id, item)
  }

  async setItems(items: Item[]) {
    super.setItems(items)
    await this.index.upsertMany(items)
  }

  async deleteItemById(id: string) {
    super.deleteItemById(id)
    await this.index.delete(id)
  }
}

export class LayerItemIndex extends LayerItemStore {
  public index: VectorStore
  constructor(index: VectorStore) {
    super()
    this.index = index
  }
  addLayer(id: string, store: ItemStore): void {
    super.addLayer(id, store)
    const allItems = store.getAllItems()
    if (allItems.length > 0) {
      store.setItems(allItems)
      this.index.upsertMany(allItems)
    }
    store.emitter.on("upsert", (event: any) => {
      this.index.upsertMany(event)
    })
    store.emitter.on("delete", (event: any) => {
      this.index.deleteMany(event)
    })
  }
}
