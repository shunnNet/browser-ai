import type { Item } from "./ItemStore"
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

  items(items: Item[], name: string = "Item") {
    return items
      .map((item) => {
        return this.section(
          `${name} id:${item.id}`,
          `
        Name: ${item.id}
        Type: ${item.type || name}
        Description: ${item.description}
        `,
          2,
        )
      })
      .join("\n\n")
  }

  whichItem(question: string, content: string, items: Item[], name?: string) {
    return this.question(
      `Which item ${question}`,
      content,
      `Below are available items. You must answer by only 1 item id from below elements with no other words. If no appropriate item, say '${
        this.none
      }'.
${this.items(items, name)}`,
    )
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

  pickTool(content: string, tools: Tool[]) {
    const functionPrompts = this.items(
      tools.map<Item>((t) => {
        return {
          id: t.name,
          description: JSON.stringify(t.schema),
          type: "Function",
          data: {},
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

  categrorize(
    content: string,
    question: string,
    categories: [string, string[]][],
  ) {
    const primaryCategories = categories.map((c) => c[0]).join(", ")
    const secondaryCategories = categories
      .map((c) => `--${c[0]} secondary category--` + "\n" + c[1].join("\n"))
      .join(", ")
    return this.question(
      question,
      content,
      `Answer by 1 primary category, and 1 of its secondary category from below. You must answer by JSON array like ["primary", "secondary"] with no any other words.` +
        "\n" +
        primaryCategories +
        "\n" +
        secondaryCategories,
    )
  }
  chooseAndAnswer(content: string, questionGroups: [string, string[]][]) {
    const primaryCategories = questionGroups.map((c) => c[0]).join(", ")
    const secondaryCategories = questionGroups
      .map((c) => `--${c[0]} questions--` + "\n" + c[1].join("\n"))
      .join("\n\n")
    return this.question(
      "Choose 1 category then answer all questions under the chosen category from below." +
        "\n" +
        primaryCategories +
        "\n" +
        secondaryCategories,
      content,
      `Answer by category and all its question's answer by JSON array like ["category", "answer1", "answer2", ...] with no any other words.`,
    )
  }
}
