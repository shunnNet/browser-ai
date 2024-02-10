<script setup lang="ts">
// import { TestFunctionAsync } from "../functional"
import { getEmbedding, EmbeddingIndex } from "client-vector-search"
const search = async () => {
  // getEmbedding is an async function, so you need to use 'await' or '.then()' to get the result
  const embedding = await getEmbedding("Apple") // Returns embedding as number[]

  // Each object should have an 'embedding' property of type number[]
  const initialObjects = [
    { id: 1, name: "Apple", embedding: embedding },
    { id: 2, name: "Banana", embedding: await getEmbedding("Banana") },
    { id: 3, name: "Cheddar", embedding: await getEmbedding("Cheddar") },
    { id: 4, name: "Space", embedding: await getEmbedding("Space") },
    { id: 5, name: "database", embedding: await getEmbedding("database") },
  ]
  const index = new EmbeddingIndex(initialObjects) // Creates an index

  // The query should be an embedding of type number[]
  const queryEmbedding = await getEmbedding("Fruit") // Query embedding
  console.log("queryEmbedding", queryEmbedding)
  // const results = await index.search(queryEmbedding, { topK: 5 }) // Returns top similar objects

  // specify the storage type
  await index.saveIndex("indexedDB")
  const results = await index.search(await getEmbedding("App"), {
    topK: 5,
    useStorage: "indexedDB",
    // storageOptions: { // use only if you overrode the defaults
    //   indexedDBName: 'clientVectorDB',
    //   indexedDBObjectStoreName: 'ClientEmbeddingStore',
    // },
  })

  console.log(results)

  await index.deleteIndexedDB() // if you overrode default, specify db name
}
</script>
<template>
  <div>
    <button
      @click="search"
      v-ai="{
        id: 'Search VectorStore',
        description:
          'You can click this button to start search any sentences or words in vector database by clicking button.',
      }"
    >
      Search
    </button>
  </div>
  <!-- <Suspense>
    <template #default>
      <div>
        <TestFunctionAsync :time="1500" />
      </div>
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense> -->
</template>
<style></style>
