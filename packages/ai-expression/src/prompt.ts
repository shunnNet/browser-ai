import type { Item } from "./Item"
import type { Tool } from "./Tool"

export class Prompt {
  spliter: string
  none: string

  constructor(spliter: string = "-", none: string = "I dont know") {
    this.spliter = spliter
    this.none = none
  }

  question(
    question: string,
    content: string,
    instruction: string,
    answer?: string,
  ) {
    return `Read the "Content" section, then anwser the question in "Question" section, fill your answer in "Answer" section and strictly follow the instructions in "Instruction" section.

${this.section("Content", content)}

${this.section("Question", `According to the "Content" section,  ${question}`)}

${this.section("Instruction", instruction)}

${this.section("Anwser", answer || "")}

`
  }

  yesNo(question: string, content: string) {
    return this.question(
      question,
      content,
      `Answer by "yes" or "no" with no other words. If you don't know, answer "${this.none}"`,
    )
  }

  cboice(question: string, content: string, choices: string[]) {
    return this.question(
      question,
      content,
      `You must answer with one of these: ${choices
        .map((c) => `"${c}"`)
        .join(",")} with no other words. If you don't know, anwser "${
        this.none
      }"`,
    )
  }

  cboices(question: string, content: string, choices: string[], max: number) {
    return this.question(
      question,
      content,
      `You must answer with 1 ~ ${max} of these: ${choices
        .map((c) => `"${c}"`)
        .join(
          ",",
        )} with JSON array and with no other words. If you don't know, anwser []`,
    )
  }

  items(items: Item[], type: string = "Item") {
    return items
      .map((item) => {
        return this.section(
          `${type} id:${item.id}`,
          `
        Name: ${item.id}
        Description: ${item.description}
        `,
          2,
        )
      })
      .join("\n\n")
  }

  section(name: string, content: string, level: number = 3) {
    const spliter = this.spliter.repeat(level)
    return `${spliter}${name}${spliter}
${content}`
  }

  event(name: string, events: string[]) {
    return `${name}: (Top-down: sorted from recent to distant in time)
${events.join("\n")}
`
  }

  suggestActions(content: string, actions: Item[]) {
    return this.question(
      "Which actions may user takes next?",
      content,
      `Below are available actions, You must answer by action ids from below actions with JSON array '["id1", "id2",...]' with no other words. If no appropriate action, say '[]', and we will not make any suggestion to user.
${this.items(actions, "Action")}
`,
    )
  }

  // TODO: maybe Item should have "type" attribute for determine type para in .items()?
  element(question: string, content: string, elements: Item[]) {
    return this.question(
      question,
      content,
      `Below are available elements. You must answer by only 1 element id from below elements with no other words. If no appropriate element, say 'no', the other agent will navigate user to the place.
${this.items(elements, "Element")}`,
    )
  }

  elements(question: string, content: string, elements: Item[]) {
    return this.question(
      question,
      content,
      `Below are available elements. You must answer by only element ids from below elements with JSON array '["id1", "id2",...]' with no other words, the other agent will navigate user to the place. If no appropriate element, say '[]', 
${this.items(elements, "Element")}`,
    )
  }

  pickTool(content: string, tools: Tool[]) {
    const functionPrompts = this.items(
      tools.map<Item>((t) => {
        return {
          id: t.name,
          description: JSON.stringify(t.schema),
        }
      }),
      "Function",
    )

    const prompt = this.question(
      "Choose 1 function and pass args for fulfilling the request.",
      content,
      `Choose 1 function from below, you MUST follow the JSON Schema when passing args to the function.

${functionPrompts}`,
      `{
        "func": <function-id-to-be-call>
        "args": <function-args>
      }`,
    )

    return prompt
  }

  correction(wrong: string, correct: string, content: string = "") {
    return this.question(
      `You gave the wrong answer previously: ${wrong}
Please correct it with strictly follow the instruction in "Instruction" section`,
      content,
      correct,
    )
  }

  correctionChoice(wrong: string, choices: string[]) {
    return this.correction(
      wrong,
      `Anwser with one of the following item with no other words:
${choices.join("\n")}`,
    )
  }

  correctionJSON(wrong: string, hint?: string) {
    let correct = "The answer should be valid JSON with no other words"
    if (hint) {
      correct += `
---example---
${hint}`
    }

    return this.correction(wrong, correct)
  }
  correctionRequiredSentence(wrong: string, sentences: string[]) {
    return this.correction(
      wrong,
      `The anwser MUST include 1 or more sentences at below.
---sentences you need fill in(1 or more)---
${sentences.join("\n")}
      `,
    )
  }
}