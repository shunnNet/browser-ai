import type { Item } from "./Item"
import type { Tool } from "./Tool"
import type { TPromptTemplate } from "./types"

/**
 * I need you anwser the question based on following content. ${logicMessage}

---content---

${content}

${appendix || ""}

---your anwser---

*/

export const BASE: TPromptTemplate = (logicMessage, content, appendix) => {
  return `I need you anwser the question based on following content. ${logicMessage}

---content---
${content}

${appendix || ""}

---your anwser---

`
}

export function YES_NO(purpose: string, auxiliary_verb: string) {
  return `${auxiliary_verb} ${purpose} ? Answer by "yes" or "no" with no other words. If you dont know, answer "none"`
}

export function CHOICES(purpose: string, choices: string[]) {
  return `Which one is ${purpose} ? You must answer with one of these: ${choices
    .map((c) => `"${c}"`)
    .join(",")} with no other words. If you don't know, anwser "none"`
}

export function ITEMS(items: Item[], type: string = "Item") {
  return items
    .map((item) => {
      return `---${type} id:${item.id}---
Name: ${item.id}
Description: ${item.description}
`
    })
    .join("\n\n")
}

export function EVENT(name: string, events: string[]) {
  return `---${name} (Top-down: sorted from recent to distant in time)---
${events.join("\n")}
`
}

export function SUGGEST_ACTIONS() {
  return `Which actions may user takes next? You must answer by only action ids like JSON array '["id1", "id2",...]' with no other words. If no appropriate action, say '[]', and we will not make any suggestion to user.`
}

export function ELEMENT(description: string) {
  return `Which element ${description}? You must answer by only 1 element id with no other words. If no appropriate element, say 'no', and the other agent will navigate user to other place.`
}

export function ELEMENTS(description: string) {
  return `Which elements ${description}? You must answer by only element ids like JSON array '["id1", "id2",...]' with no other words. If no appropriate element, say '[]', and the other agent will navigate user to other place.`
}

export function PICK_TOOL(content: string, tools: Tool[]) {
  const functionPrompts = tools
    .map((t, index) => {
      return `---function ${index + 1}---
Function name: ${t.name}
Function JSON Schema: ${JSON.stringify(t.schema)}
`
    })
    .join("\n\n")
  const prompt = `I need you choose 1 function and pass args for fulfill the request based on following content. You MUST follow the JSON Schema to pass args to function.

---question---

---content---
${content}

${functionPrompts}

---your anwser---
{
"func": <function-name-to-be-call>
"args": <function-args>
}`
  return prompt
}

export function CORRECTION(wrong: string, correct: string) {
  return `You gave an answer with wrong format, I need you correct the answer to the correct format with no other words.

---previous anwser---
${wrong}

---correct format---
${correct}

---anwser with correct format---

`
}

export function CORRECTION_CHOICES(wrong: string, choices: string[]) {
  return CORRECTION(
    wrong,
    `Anwser with one of the following item with no other words:
${choices.join("\n")}`,
  )
}

export function CORRECTION_JSON(wrong: string, hint?: string) {
  let correct = "The answer should be valid JSON with no other words"
  if (hint) {
    correct += `
---example---
${hint}`
  }

  return CORRECTION(wrong, correct)
}

export function CORRECTION_REQUIRED_SENTENCES(
  wrong: string,
  sentences: string[],
) {
  return `You gave an unexpected answer, the anwser should include 1 or more sentences. I need you fill in the sentences to the previous answer in appropriate place, or fix it if the sentence in anwser is broken, with no change to other part of anwser.

---previous anwser---
${wrong}

---sentences you need fill in(1 or more)---
${sentences.join("\n")}

---anwser with correct format---

`
}
