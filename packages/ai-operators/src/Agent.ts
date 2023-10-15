export type AgentClient = (prompt: string) => Promise<string>

export class Agent {
  public content: string
  public client: AgentClient
  constructor(client: AgentClient) {
    this.client = client
    this.content = ""
  }

  check(content: string) {
    this.content = content
  }

  computePrompt(logicMessage: string) {
    return `I need you anwser the question based on following content. ${logicMessage}

---content---
${this.content}

---your anwser---

`
  }

  async logic(logicMessage: string) {
    const message = await this.client(this.computePrompt(logicMessage))
    return message
  }

  async does(purpose: string) {
    const message = await this.logic(
      `Does ${purpose} ? If yes, answer "yes". If no, answer "no". If you dont know, answer "none"`,
    )

    if (message === "yes") {
      return true
    } else if (message === "no") {
      return false
    } else {
      return
    }
  }
  async is(statement: string) {
    const message = await this.logic(
      `Is ${statement} ? If yes, answer "yes". If no, answer "no". If you dont know, answer "none"`,
    )

    if (message === "yes") {
      return true
    } else if (message === "no") {
      return false
    } else {
      return
    }
  }

  async whichIs(purpose: string, choices: string[]) {
    const message = await this.logic(
      `Which one is ${purpose} ? You must answer with one of these: ${choices
        .map((c) => `"${c}"`)
        .join(",")}. If you don't know, anwser "none"`,
    )

    return message
  }
}

// "use strict";
// Object.defineProperty(exports, "__esModule", { value: true });
// exports.SUFFIX = exports.FORMAT_INSTRUCTIONS = exports.PREFIX = void 0;
// exports.PREFIX = `Answer the following questions as best you can. You have access to the following tools:`;
// exports.FORMAT_INSTRUCTIONS = `Use the following format in your response:

// Question: the input question you must answer
// Thought: you should always think about what to do
// Action: the action to take, should be one of [{tool_names}]
// Action Input: the input to the action
// Observation: the result of the action
// ... (this Thought/Action/Action Input/Observation can repeat N times)
// Thought: I now know the final answer
// Final Answer: the final answer to the original input question`;
// exports.SUFFIX = `Begin!

// Question: {input}
// Thought:{agent_scratchpad}`;
