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
  create: { id: string; item: Item }
  update: { id: string; item: Item }
  delete: { id: string }
}

export class ItemStore {
  static fromStores(stores: ItemStore[]) {
    return new ItemStore(stores.map((store) => store.getAllItems()).flat())
  }

  protected _items: Record<string, Item> = {}
  public emitter: Emitter<ItemStoreEvent>

  constructor(items?: Item[]) {
    this._items = {}
    this.emitter = mitt<ItemStoreEvent>()
    if (Array.isArray(items)) {
      items.forEach((item) => {
        this.setItemById(item.id, item)
      })
    }
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
    return this.items[id]
  }

  setItemById(id: string, item: Item) {
    this.emitter.emit(id in this.items ? "create" : "update", { id, item })
    this.items[id] = item
  }

  deleteItemById(id: string) {
    this.emitter.emit("delete", { id })
    delete this.items[id]
  }
}

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
