import defu from "defu"
import mitt, { Emitter } from "mitt"

export type Item = {
  id: string
  description: string
  type: string
  data: Record<string, any>
}

export const createItem = (
  id: string,
  description: string,
  type?: string,
  data?: Record<string, any>,
): Item => {
  return {
    id,
    description,
    type: type || "Item",
    data: data || {},
  }
}

type ItemStoreEvent = {
  upsert: Item[]
  delete: string[]
}

export class ItemStore {
  static fromStores(stores: ItemStore[]) {
    const s = new ItemStore()
    s.setItems(stores.map((store) => store.getAllItems()).flat())
    return s
  }

  protected _items: Record<string, Item> = {}
  public emitter: Emitter<ItemStoreEvent>

  constructor() {
    this._items = {}
    this.emitter = mitt<ItemStoreEvent>()
  }

  get items() {
    return this._items
  }

  getAllItems() {
    return Object.values(this.items)
  }

  getItemIds() {
    return Object.keys(this.items)
  }

  getItemById(id: string): Item {
    return this.items[id] || null
  }

  setItems(items: Item[]) {
    items.forEach((item) => {
      this.items[item.id] = item
    })
    this.emitter.emit("upsert", items)
  }

  setItemById(id: string, item: Item) {
    this.emitter.emit("upsert", [item])
    this.items[id] = item
  }

  deleteItemById(id: string) {
    this.emitter.emit("delete", [id])
    delete this.items[id]
  }
}

// TODO: may occur duplicate event when using ItemIndex with LayerItemIndex
export class LayerItemStore {
  protected layers: Map<string, ItemStore>

  constructor() {
    this.layers = new Map()
  }

  addLayer(id: string, store: ItemStore) {
    this.layers.set(id, store)
  }

  getLayerById(id: string): ItemStore | null {
    return this.layers.get(id) || null
  }

  getAllItems(): Item[] {
    const ids = this.getItemIds()
    return ids
      .map((id) => this.getItemById(id))
      .filter((item) => item !== null) as Item[]
  }

  getItemById(id: string): Item | null {
    let collection = {}
    for (const [, store] of this.layers) {
      const item = store.getItemById(id)
      if (item) {
        collection = defu(collection, item)
      }
    }
    return Object.keys(collection).length > 0 ? (collection as Item) : null
  }

  getItemIds(): string[] {
    return Array.from(this.layers.values()).reduce((acc, store) => {
      return acc.concat(store.getItemIds())
    }, [] as string[])
  }
}
