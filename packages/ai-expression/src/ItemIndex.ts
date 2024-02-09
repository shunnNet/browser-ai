import { ItemStore, LayerItemStore, Item } from "./ItemStore"

export interface VectorStore {
  upsert(id: string, item: Item): Promise<void>
  delete(id: string): Promise<void>
}

export class ItemIndex extends ItemStore {
  public index: VectorStore
  constructor(index: VectorStore, items?: Record<string, Item>) {
    super(items)
    this.index = index
  }

  async setItemById(id: string, item: Item) {
    super.setItemById(id, item)
    await this.index.upsert(id, item)
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
    store.emitter.on("create", (event: any) => {
      this.index.upsert(event.id, event.item)
    })
    store.emitter.on("update", (event: any) => {
      this.index.upsert(event.id, event.item)
    })
    store.emitter.on("delete", (event: any) => {
      this.index.delete(event.id)
    })
  }
}
