// import { defineAsyncComponent } from "vue"

// const sleep = (time: number) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve("done")
//     }, time)
//   })
// }

// type TestFunctionProps = {
//   time: number
// }

// export const TestFunctionAsync = defineAsyncComponent(() => {
//   return new Promise(async (resolve) => {
//     await sleep(1500)
//     return resolve((props: Any) => {
//       return "TestFunctionAsync: " + props.time
//     })
//   })
// })
