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

export interface ItemManipulator<T extends Item = Item> {
  getAllItems(): T[]
  getItemIds(): string[]
  getItemById(id: string): T
  setItemById(id: string, item: T): any
  deleteItemById(id: string): any
  deleteAllItems(): any
}

export class ItemStore<T extends Item = Item> implements ItemManipulator<T> {
  static fromItems(items: Item[]) {
    return new ItemStore(
      items.reduce((acc, item) => {
        return { ...acc, [item.id]: item }
      }, {}),
    )
  }

  static fromStores(stores: ItemStore[]) {
    return new ItemStore(
      stores
        .map((store) => {
          return store.items
        })
        .reduce((acc, items) => {
          return { ...acc, ...items }
        }, {}),
    )
  }

  protected _items: Record<string, T> = {}
  constructor(items?: Record<string, T>) {
    this._items = items || {}
  }

  get items() {
    return this._items
  }

  createItem(
    id: string,
    description: string,
    type?: string,
    data?: Record<string, any>,
  ): Item {
    return {
      id,
      description,
      type: type || "Item",
      data: data || {},
    }
  }

  getAllItems() {
    return Object.values(this.items)
  }

  getItemIds() {
    return Object.keys(this.items)
  }

  getItemById(id: string): T {
    return this.items[id]
  }

  setItemById(id: string, item: T): ItemStore<T> {
    this.items[id] = item

    return this
  }

  deleteItemById(id: string): ItemStore<T> {
    delete this.items[id]

    return this
  }

  deleteAllItems() {
    Object.keys(this.items).forEach((id) => {
      this.deleteItemById(id)
    })
    return this
  }
}
