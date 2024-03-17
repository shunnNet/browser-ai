import { expect, describe, it, vi } from "vitest"
import { LayerItemStore, ItemStore, createItem } from "../src/ItemStore"

describe("ItemStore", () => {
  it("should initialize with empty items", () => {
    const itemStore = new ItemStore()
    expect(itemStore.items).toEqual({})
  })
  it("should add many items to the store", () => {
    const itemStore = new ItemStore()
    const item1 = createItem("item1", "description")
    const item2 = createItem("item2", "description")
    itemStore.setItems([item1, item2])
    expect(itemStore.getItemById("item1")).toEqual(item1)
    expect(itemStore.getItemById("item2")).toEqual(item2)
  })

  it("should add an item to the store", () => {
    const itemStore = new ItemStore()
    const item = createItem("item1", "description")
    itemStore.setItemById(item.id, item)
    expect(itemStore.items).toEqual({ item1: item })
  })

  it("should retrieve an item by ID", () => {
    const itemStore = new ItemStore()
    const item = createItem("item1", "description")
    itemStore.setItemById(item.id, item)
    const retrievedItem = itemStore.getItemById(item.id)
    expect(retrievedItem).toEqual(item)
  })

  it("should return null when item is not found", () => {
    const itemStore = new ItemStore()
    const retrievedItem = itemStore.getItemById("item2")
    expect(retrievedItem).toBe(null)
  })

  it("should delete an item from the store", () => {
    const itemStore = new ItemStore()
    const item = createItem("item1", "description")
    itemStore.setItemById(item.id, item)
    itemStore.deleteItemById(item.id)
    expect(itemStore.items).toEqual({})
  })

  it("should return all item IDs", () => {
    const itemStore = new ItemStore()
    const item1 = createItem("item1", "description")
    const item2 = createItem("item2", "description")
    itemStore.setItemById(item1.id, item1)
    itemStore.setItemById(item2.id, item2)
    const itemIds = itemStore.getItemIds()
    expect(itemIds).toEqual(["item1", "item2"])
  })

  it("should return all items", () => {
    const itemStore = new ItemStore()
    const item1 = createItem("item1", "description")
    const item2 = createItem("item2", "description")
    itemStore.setItemById(item1.id, item1)
    itemStore.setItemById(item2.id, item2)
    const allItems = itemStore.getAllItems()
    expect(allItems).toEqual([item1, item2])
  })

  it("should create an instance of ItemStore from multiple stores", () => {
    const itemStore1 = new ItemStore()
    const itemStore2 = new ItemStore()
    const item1 = createItem("item1", "description")
    const item2 = createItem("item2", "description")
    itemStore1.setItemById(item1.id, item1)
    itemStore2.setItemById(item2.id, item2)
    const itemStore = ItemStore.fromStores([itemStore1, itemStore2])

    expect(itemStore.getItemById("item1")).toEqual(item1)
    expect(itemStore.getItemById("item2")).toEqual(item2)
  })

  describe("event", () => {
    it("should emit delete event when deleteItemById", () => {
      const itemStore = new ItemStore()
      const item = createItem("item1", "description")
      itemStore.setItemById(item.id, item)
      const deleteHandler = vi.fn(() => {})
      itemStore.emitter.on("delete", deleteHandler)
      itemStore.deleteItemById(item.id)
      expect(deleteHandler).toHaveBeenCalledWith([item.id])
    })

    it("should emit upsert event when setItemById", async () => {
      const itemStore = new ItemStore()
      const item = createItem("item1", "description")
      const createHandler = vi.fn(() => {})
      itemStore.emitter.on("upsert", createHandler)
      itemStore.setItemById(item.id, item)

      // console.log(createHandler.mock.calls)
      expect(createHandler).toHaveBeenCalledWith([item])
    })

    it("should emit upsert event when setItemById", () => {
      const itemStore = new ItemStore()
      const item = createItem("item1", "description")
      itemStore.setItemById(item.id, item)
      const updateHandler = vi.fn(() => {})
      itemStore.emitter.on("upsert", updateHandler)
      itemStore.setItemById(item.id, {
        ...item,
        description: "new description",
      })
      expect(updateHandler).toHaveBeenCalledWith([
        { ...item, description: "new description" },
      ])
    })
  })
})
describe("LayerItemStore", () => {
  it("should add and retrieve layers correctly", () => {
    const store = new LayerItemStore()
    const itemStore1 = new ItemStore()
    const itemStore2 = new ItemStore()

    store.addLayer("layer1", itemStore1)
    store.addLayer("layer2", itemStore2)

    expect(store.getLayerById("layer1")).toBe(itemStore1)
    expect(store.getLayerById("layer2")).toBe(itemStore2)
    expect(store.getLayerById("layer3")).toBe(null)
  })

  it("should return all items from all layers", () => {
    const store = new LayerItemStore()
    const itemStore1 = new ItemStore()
    const itemStore2 = new ItemStore()

    const item1 = createItem("item1", "Item 1")
    const item2 = createItem("item2", "Item 2")

    itemStore1.setItemById("item1", item1)
    itemStore2.setItemById("item2", item2)

    store.addLayer("layer1", itemStore1)
    store.addLayer("layer2", itemStore2)

    const allItems = store.getAllItems()

    expect(allItems).toHaveLength(2)
    expect(allItems).toContainEqual(item1)
    expect(allItems).toContainEqual(item2)
  })

  it("should retrieve item by ID from all layers", () => {
    const store = new LayerItemStore()
    const itemStore1 = new ItemStore()
    const itemStore2 = new ItemStore()

    const item1 = createItem("item1", "Item 1")
    const item2 = createItem("item2", "Item 2")

    itemStore1.setItemById("item1", item1)
    itemStore2.setItemById("item2", item2)

    store.addLayer("layer1", itemStore1)
    store.addLayer("layer2", itemStore2)

    const result = store.getItemById("item2")

    expect(result).toEqual(item2)
  })
  it("should return undefined when item is not found", () => {
    const store = new LayerItemStore()
    const itemStore1 = new ItemStore()
    const itemStore2 = new ItemStore()

    const item1 = createItem("item1", "Item 1")
    const item2 = createItem("item2", "Item 2")

    itemStore1.setItemById("item1", item1)
    itemStore2.setItemById("item2", item2)

    store.addLayer("layer1", itemStore1)
    store.addLayer("layer2", itemStore2)

    const result = store.getItemById("item3")

    expect(result).toEqual(null)
  })

  it("should return undefined when item is not found", () => {
    const store = new LayerItemStore()
    const itemStore1 = new ItemStore()
    const itemStore2 = new ItemStore()

    const item1 = createItem("item1", "Item 1")
    const item2 = createItem("item2", "Item 2")

    itemStore1.setItemById("item1", item1)
    itemStore2.setItemById("item2", item2)

    store.addLayer("layer1", itemStore1)
    store.addLayer("layer2", itemStore2)

    const itemIds = store.getItemIds()

    expect(itemIds).toContain("item1")
    expect(itemIds).toContain("item2")
  })
})
