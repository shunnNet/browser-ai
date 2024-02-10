// export const geminiClient = async () => {
//   const result = await fetch(
//     `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=apikey`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         contents: [
//           {
//             parts: [
//               {
//                 text: "Write a story about a magic backpack",
//               },
//             ],
//           },
//         ],
//       }),
//     },
//   ).then((res) => res.json())

//   return result
// }

// export const geminiChatClient = async () => {
//   const result = await fetch(
//     `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=apikey`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         contents: [
//           { role: "user", parts: [{ text: "Hello" }] },
//           { role: "model", parts: [{ text: "User entered the page" }] },
//           { role: "user", parts: [{ text: "How's today" }] },
//           // .....
//         ],
//         generationConfig: {
//           temperature: 0,
//         },
//       }),
//     },
//   ).then((res) => res.json())

//   return result
// }

// export const geminiStreamChatClient = async () => {
//   const result = await fetch(
//     `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=apikey`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         contents: [
//           { role: "user", parts: [{ text: "Hello" }] },
//           { role: "model", parts: [{ text: "User entered the page" }] },
//           { role: "user", parts: [{ text: "Show me some products" }] },
//           // .....
//         ],
//         generationConfig: {
//           temperature: 0,
//         },
//       }),
//     },
//   )
//   const reader = result.body?.pipeThrough(new TextDecoderStream()).getReader()
//   let raw = ""
//   while (true) {
//     console.log("Read")

//     const { done, value } = await reader?.read()
//     try {
//       if (value?.startsWith(",") && value?.endsWith("]")) {
//         const data = JSON.parse(value.slice(1).slice(0, -1))
//         console.log(data.candidates[0].content.parts[0].text)
//       } else if (value?.startsWith(",")) {
//         const data = JSON.parse(value.slice(1))
//         console.log(data.candidates[0].content.parts[0].text)
//       } else if (value?.startsWith("[")) {
//         const data = JSON.parse(value.slice(1))
//         console.log(data.candidates[0].content.parts[0].text)
//       } else if (done) {
//         console.log("Done", value)
//         break
//       }
//     } catch (e) {
//       console.log(value)
//       console.error(e)
//     }

//     raw += value
//   }
//   // const data = JSON.parse(raw.match(/data\:\s(.+)/)?.[0].replace("data: ", ""))
//   // return data

//   return JSON.parse(raw)
// }
