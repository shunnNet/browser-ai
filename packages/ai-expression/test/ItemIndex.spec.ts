import { expect, describe, it, vi } from "vitest"
import { ItemIndex, LayerItemIndex, VectorStore } from "../src/ItemIndex"
import { ItemStore, createItem } from "../src/ItemStore"

class TestVectorStore implements VectorStore {
  upsert = vi.fn(async () => {})
  upsertMany = vi.fn(async () => {})
  delete = vi.fn(async () => {})
  deleteMany = vi.fn(async () => {})
}

describe("ItemIndex", () => {
  it("should initialize with index", () => {
    const vs = new TestVectorStore()
    const itemIndex = new ItemIndex(vs)
    expect(itemIndex.index).toBe(vs)
  })

  it("should add an item to the store and index", async () => {
    const vs = new TestVectorStore()
    const itemIndex = new ItemIndex(vs)
    const item = createItem("item1", "description")
    await itemIndex.setItemById(item.id, item)
    expect(vs.upsert).toHaveBeenCalledWith(item.id, item)
  })
  it("should add items to the store and index", async () => {
    const vs = new TestVectorStore()
    const itemIndex = new ItemIndex(vs)
    const item1 = createItem("item1", "description")
    const item2 = createItem("item2", "description")
    await itemIndex.setItems([item1, item2])
    expect(vs.upsertMany).toHaveBeenCalledWith([item1, item2])
  })

  it("should delete an item from the store and index", async () => {
    const vs = new TestVectorStore()
    const itemIndex = new ItemIndex(vs)
    const item = createItem("item1", "description")
    // await itemIndex.setItemById(item.id, item)
    await itemIndex.deleteItemById(item.id)
    expect(vs.delete).toHaveBeenCalledWith(item.id)
  })
})

describe("LayerItemIndex", () => {
  it("should add a layer and update the index", () => {
    const vs = new TestVectorStore()
    const itemStore = new ItemStore()
    const items = [
      createItem("item1", "description"),
      createItem("item2", "description"),
    ]
    itemStore.setItems(items)
    const layerItemIndex = new LayerItemIndex(vs)
    layerItemIndex.addLayer("layer1", itemStore)
    expect(vs.upsertMany).toHaveBeenCalledWith(items)
  })

  it("should call index upsertMany when an item is added", () => {
    const vs = new TestVectorStore()
    const itemStore = new ItemStore()
    const layerItemIndex = new LayerItemIndex(vs)
    layerItemIndex.addLayer("layer1", itemStore)
    const item = createItem("item1", "description")
    itemStore.setItemById(item.id, item)

    expect(vs.upsertMany).toHaveBeenCalledWith([item])
  })

  it("should call index deleteMany when an item is deleted", () => {
    const vs = new TestVectorStore()
    const itemStore = new ItemStore()
    const layerItemIndex = new LayerItemIndex(vs)
    layerItemIndex.addLayer("layer1", itemStore)
    const item = createItem("item1", "description")
    itemStore.setItemById(item.id, item)
    itemStore.deleteItemById(item.id)
    expect(vs.deleteMany).toHaveBeenCalledWith([item.id])
  })
})
