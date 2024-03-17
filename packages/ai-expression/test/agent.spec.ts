import { expect, vi, describe, it, beforeEach, Mock } from "vitest"
import { Agent } from "../src/Agent"
import { Tool } from "../src/Tool"

class MockClient {
  expression: Mock
  chat: Mock

  constructor(mockExpression?: any) {
    this.expression = vi.fn(mockExpression || (() => "OK"))
    this.chat = vi.fn(() => "OK")
  }
}
const fakePrompt = "fakePrompt"
describe("Agent", () => {
  describe("check", () => {
    let agent: Agent
    let mockClient: MockClient

    beforeEach(() => {
      mockClient = new MockClient()
      agent = new Agent(mockClient)
    })
    it("should set the content property", () => {
      const content = "test content"
      agent.check(content)
      expect(agent.content).toBe(content)
    })
  })

  describe("instruct", () => {
    let agent: Agent
    let mockClient: MockClient

    beforeEach(() => {
      mockClient = new MockClient()
      agent = new Agent(mockClient)
    })
    it("should set the systemMessage property", () => {
      const systemMessage = "test system message"
      agent.instruct(systemMessage)
      expect(agent.systemMessage).toBe(systemMessage)
    })
  })
  describe("forget", () => {
    let agent: Agent
    let mockClient: MockClient

    beforeEach(() => {
      mockClient = new MockClient()
      agent = new Agent(mockClient)
    })
    it("should unset the content property", () => {
      agent.check("test content").forget()
      expect(agent.content).toBe("")
    })
  })

  describe("withContext", () => {
    let agent: Agent
    const inContextMessage = "inContext"
    beforeEach(() => {
      agent = new Agent(new MockClient())
      agent.instruct(fakePrompt).check(fakePrompt)
    })
    it(`should overwrite the content only in callback when passing string, 
and reset after callback end execution.`, async () => {
      await agent.withContext(inContextMessage, () => {
        expect(agent.content).toBe(inContextMessage)
        expect(agent.systemMessage).toBe(fakePrompt)
      })

      expect(agent.content).toBe(fakePrompt)
      expect(agent.systemMessage).toBe(fakePrompt)
    })
    it(`should overwrite the content and systemMessage in callback when passing object, 
and reset after callback end execution.`, async () => {
      await agent.withContext(
        { content: inContextMessage, systemMessage: inContextMessage },
        () => {
          expect(agent.content).toBe(inContextMessage)
          expect(agent.systemMessage).toBe(inContextMessage)
        },
      )

      expect(agent.content).toBe(fakePrompt)
      expect(agent.systemMessage).toBe(fakePrompt)
    })

    it("should reset the content and systemMessage when callback throw", async () => {
      expect(() =>
        agent.withContext(
          { content: inContextMessage, systemMessage: inContextMessage },
          () => {
            throw new Error("fail in callback")
          },
        ),
      ).rejects.toThrow()
      expect(agent.content).toBe(fakePrompt)
      expect(agent.systemMessage).toBe(fakePrompt)
    })
  })

  describe("choice", async () => {
    const question = "question"
    const choices = [
      "choice1",
      ["choice2", true],
      ["choice3", () => "choice3-response"],
      () => "default",
    ]

    const createAgent = (expression?: any) => {
      const client = new MockClient(expression)
      const agent = new Agent(client)
      agent.instruct(fakePrompt).check(fakePrompt)
      return { agent, client }
    }
    it("should call client.expression with correspnding prompt", async () => {
      const { agent, client } = createAgent()
      const choices = ["choice1", "choice2"]

      await agent.choice(question, choices)
      const { prompt, systemMessage } = client.expression.mock.calls[0][0]

      expect(prompt).toMatchFileSnapshot("./snapshots/choice-prompt.txt")
      expect(systemMessage).toBe(fakePrompt)
    })
    it("should return the choice AgentClient selected", async () => {
      const { agent } = createAgent(() => choices[0])
      const result = await agent.choice(question, choices)

      expect(result).toBe(choices[0])
    })
    it(`should only retry 1 more times when AgentClient respond with wrong answer first time.
And return one of choices when AgentClient return right answer second time.`, async () => {
      const { agent, client } = createAgent(() => choices[0])
      client.expression.mockImplementationOnce(() => "wrong")

      const result = await agent.choice(question, choices)
      expect(client.expression.mock.calls.length).toBe(2)
      expect(result).toBe(choices[0])
    })

    it(`should return the second value of tuple when selected choice is [string, value].`, async () => {
      const { agent } = createAgent(() => choices[1][0])
      const result = await agent.choice(question, choices)
      expect(result).toBe(choices[1][1])
    })
    it(`should call the second value of tuple and return its result when selected choice is [string, () => value].`, async () => {
      const selected = choices[2] as [string, () => any]
      const { agent } = createAgent(() => selected[0])
      const result = await agent.choice(question, choices)
      expect(result).toBe(selected[1]())
    })
    it(`should call the value and return its result when pass "anyFunction" when non of the choices selected`, async () => {
      const selected = choices[3] as CallableFunction
      const { agent } = createAgent(() => "wrong")
      const result = await agent.choice(question, choices)
      expect(result).toBe(selected())
    })
    it(`should return null when not pass "anyFunction" when non of the choices selected`, async () => {
      const { agent } = createAgent(() => "wrong")
      const result = await agent.choice(question, ["1", "2"])
      expect(result).toBe(null)
    })
  })

  describe("yesNo", async () => {
    const question = "question"

    const createAgent = (expression?: any) => {
      const client = new MockClient(expression)
      const agent = new Agent(client)
      agent.instruct(fakePrompt).check(fakePrompt)
      return { agent, client }
    }
    it("should call client.expression with correspnding prompt", async () => {
      const { agent, client } = createAgent()
      await agent.yesNo(question)
      const { prompt, systemMessage } = client.expression.mock.calls[0][0]

      expect(prompt).toMatchFileSnapshot("./snapshots/yesno-prompt.txt")
      expect(systemMessage).toBe(fakePrompt)
    })

    it("should throw error if choice does not include both 'yes' and 'no'", async () => {
      const { agent } = createAgent()
      await expect(() => agent.yesNo(question, ["no"])).rejects.toThrow()
      await expect(() => agent.yesNo(question, ["yes"])).rejects.toThrow()
    })
    it("should throw error if choice has value except 'yes' or 'no'", async () => {
      const { agent } = createAgent()
      await expect(() =>
        agent.yesNo(question, ["yes", "no", "wrong"]),
      ).rejects.toThrow()
      await expect(() =>
        agent.yesNo(question, ["yes", "no", ["wrong", () => true]]),
      ).rejects.toThrow()
    })
    it("should respond corresponding value when 'yes' or 'no' is selected.", async () => {
      const { agent: a1 } = createAgent(() => "yes")
      const r1 = await a1.yesNo(question)
      expect(r1).toBe(true)

      const { agent: a2 } = createAgent(() => "no")
      const r2 = await a2.yesNo(question)
      expect(r2).toBe(false)
    })

    it("should receive choice handler", async () => {
      const choices = [
        // choices
        ["yes", () => "T"],
        ["no", "F"],
        () => "failed",
      ]
      const { agent, client } = createAgent(() => "yes")
      const r1 = await agent.yesNo(question, choices)
      expect(r1).toBe("T")

      client.expression.mockImplementation(() => "no")
      const r2 = await agent.yesNo(question, choices)
      expect(r2).toBe("F")

      client.expression.mockImplementation(() => "wrong")
      const r3 = await agent.yesNo(question, choices)
      expect(r3).toBe("failed")
    })
  })

  describe("does", async () => {
    const question = "question"
    const createAgent = (expression?: any) => {
      const client = new MockClient(expression)
      const agent = new Agent(client)
      agent.instruct(fakePrompt).check(fakePrompt)
      return { agent, client }
    }
    it("should call client.expression with correspnding prompt", async () => {
      const { agent, client } = createAgent()
      await agent.does(question)
      const { prompt, systemMessage } = client.expression.mock.calls[0][0]

      expect(prompt).toMatchFileSnapshot("./snapshots/does-prompt.txt")
      expect(systemMessage).toBe(fakePrompt)
    })
  })
  describe("is", async () => {
    const question = "question"
    const createAgent = (expression?: any) => {
      const client = new MockClient(expression)
      const agent = new Agent(client)
      agent.instruct(fakePrompt).check(fakePrompt)
      return { agent, client }
    }
    it("should call client.expression with correspnding prompt", async () => {
      const { agent, client } = createAgent()
      await agent.is(question)
      const { prompt, systemMessage } = client.expression.mock.calls[0][0]

      expect(prompt).toMatchFileSnapshot("./snapshots/is-prompt.txt")
      expect(systemMessage).toBe(fakePrompt)
    })
  })
  describe("whichOneIs", async () => {
    const question = "question"

    const createAgent = (expression?: any) => {
      const client = new MockClient(expression)
      const agent = new Agent(client)
      agent.instruct(fakePrompt).check(fakePrompt)
      return { agent, client }
    }
    it("should call client.expression with correspnding prompt", async () => {
      const { agent, client } = createAgent()
      const choices = ["choice1", "choice2"]

      await agent.whichOneIs(question, choices)
      const { prompt, systemMessage } = client.expression.mock.calls[0][0]

      expect(prompt).toMatchFileSnapshot("./snapshots/which-one-is-prompt.txt")
      expect(systemMessage).toBe(fakePrompt)
    })
  })

  describe("categorize", () => {
    const question = "question"
    const createCategories = () => {
      return {
        fruits: [
          // fruits
          "apple",
          ["banana", () => "I love bananas!"],
          () => "fallback",
        ],
        animals: [
          // animals
          ["dog", "I love dogs!"],
          "cat",
        ],
        fallback: () => "No matching category found",
      }
    }
    const createAgent = (expression?: any) => {
      const client = new MockClient(expression)
      const agent = new Agent(client)
      agent.instruct(fakePrompt).check(fakePrompt)
      return { agent, client }
    }
    it("should call client.expression with correspnding prompt", async () => {
      const { agent, client } = createAgent()
      const categories = createCategories()

      await agent.categorize(question, categories)
      const { prompt, systemMessage } = client.expression.mock.calls[0][0]

      expect(prompt).toMatchFileSnapshot("./snapshots/categorize-prompt.txt")
      expect(systemMessage).toBe(fakePrompt)
    })

    it("should return array of categorize result of the matching strategy when the callback value not specify", async () => {
      const result = ["animals", "cat"]
      const { agent } = createAgent(() => JSON.stringify(result))

      const categories = createCategories()

      const response = await agent.categorize(question, categories)

      expect(response).toEqual(result)
    })

    it("should return the value of the matching strategy within a category when callback is value", async () => {
      const { agent } = createAgent(() => JSON.stringify(["animals", "dog"]))

      const categories = createCategories()

      const result = await agent.categorize(question, categories)

      expect(result).toBe("I love dogs!")
    })

    it("should return the callback returned value of the matching strategy within a category when callback is function", async () => {
      const { agent } = createAgent(() => JSON.stringify(["fruits", "banana"]))
      const categories = createCategories()

      const result = await agent.categorize(question, categories)

      expect(result).toBe("I love bananas!")
    })

    it("should return the result of the fallback function when no matching category is found", async () => {
      const { agent } = createAgent(() => JSON.stringify(["wrong", "wrong"]))
      const question = "What is your favorite color?"
      const categories = createCategories()

      const result = await agent.categorize(question, categories)

      expect(result).toBe("No matching category found")
    })

    it("should return the result of the category fallback function when no matching choice in the category is found", async () => {
      const { agent } = createAgent(() => JSON.stringify(["fruits", "wrong"]))
      const categories = createCategories()

      const result = await agent.categorize(question, categories)

      expect(result).toBe("fallback")
    })

    it("should return categories level fallback function when client return invalid json", async () => {
      const { agent } = createAgent(() => "['invalid json]")
      const categories = createCategories()

      const resposne = await agent.categorize(question, categories)
      expect(resposne).toBe("No matching category found")
    })
  })
  describe("chooseAndAnswer", () => {
    const createChoices = () => {
      return {
        purpose1: {
          questions: ["user name", "user email", "user phone"],
          handler: vi.fn(),
        },
        purpose2: {
          questions: ["game name", "user's age"],
          handler: vi.fn(),
        },
        fallback: vi.fn(() => "No matching category found"),
      }
    }
    const createAgent = (expression?: any) => {
      const client = new MockClient(expression)
      const agent = new Agent(client)
      agent.instruct(fakePrompt).check(fakePrompt)
      return { agent, client }
    }

    it("should call client.expression with correspnding prompt", async () => {
      const { agent, client } = createAgent()
      const choices = createChoices()

      await agent.chooseAndAnswer(choices)
      const { prompt, systemMessage } = client.expression.mock.calls[0][0]

      expect(prompt).toMatchFileSnapshot(
        "./snapshots/choose-and-answer-prompt.txt",
      )
      expect(systemMessage).toBe(fakePrompt)
    })

    it("should parse the client response and call the corresponding handler", async () => {
      const { agent } = createAgent(() =>
        JSON.stringify(["purpose1", "name", "email", "phone"]),
      )
      const choices = createChoices()
      choices.purpose1.handler.mockImplementation(() => "purpose1")

      const reuslt = await agent.chooseAndAnswer(choices)

      expect(choices.purpose1.handler).toHaveBeenCalledWith([
        "purpose1",
        "name",
        "email",
        "phone",
      ])
      expect(reuslt).toBe("purpose1")
    })

    it("should call the fallback handler if no match group of answer from client", async () => {
      const { agent } = createAgent(() =>
        JSON.stringify(["wrong", "name", "email", "phone"]),
      )
      const choices = createChoices()

      const result = await agent.chooseAndAnswer(choices)

      expect(choices.fallback).toHaveBeenCalled()
      expect(result).toBe("No matching category found")
    })

    it("should call the fallback handler if the message cannot be parsed", async () => {
      const { agent } = createAgent(
        () => "[cannot parse this message to array]",
      )
      const choices = createChoices()

      const result = await agent.chooseAndAnswer(choices)

      expect(choices.fallback).toHaveBeenCalled()
      expect(result).toBe("No matching category found")
    })
  })

  describe("pickTool", () => {
    const createSimgleTool = (name: string, validate: boolean = true) => {
      return new Tool(
        vi.fn(() => {}),
        {
          name,
          description: `${name} description`,
          parameters: {
            type: "object",
            properties: {
              name: { type: "string" },
            },
          },
        },
        () => validate,
      )
    }
    const createTools = () => {
      return [createSimgleTool("tool1"), createSimgleTool("tool2", false)]
    }
    const createAgent = (expression?: any) => {
      const client = new MockClient(expression)
      const agent = new Agent(client)
      agent.instruct(fakePrompt).check(fakePrompt)
      return { agent, client }
    }
    it("should call client.expression with correct prompt", async () => {
      const { agent, client } = createAgent()
      const tools = createTools()

      await agent.pickTool(tools)
      const { prompt } = client.expression.mock.calls[0][0]

      expect(prompt).toMatchFileSnapshot("./snapshots/pick-tool-prompt.txt")
    })
    it("should return selected func, args and useIt function when client return valid result", async () => {
      const { agent, client } = createAgent()
      const tools = createTools()

      client.expression.mockImplementation(() =>
        JSON.stringify({ func: "tool1", args: { name: "tool1" } }),
      )
      const result = await agent.pickTool(tools)

      expect(result.func).toBe(tools[0].name)
      expect(result.args).toEqual({ name: "tool1" })
      expect(result.useIt).toBeInstanceOf(Function)
      expect(result.error).toBeUndefined()

      result.useIt()
      expect(tools[0].func).toHaveBeenCalledWith({ name: "tool1" })
    })
    it("should return result contain error message when tool.validate return false", async () => {
      const { agent, client } = createAgent()
      const tools = createTools()

      client.expression.mockImplementation(() =>
        JSON.stringify({ func: "tool2", args: { name: "tool1" } }),
      )
      const result = await agent.pickTool(tools)

      expect(result.error).toBeTruthy()
    })

    it("should return result contain error message when client return invalid json", async () => {
      const { agent, client } = createAgent()
      const tools = createTools()

      client.expression.mockImplementation(() => "[invalid json")
      const result = await agent.pickTool(tools)

      expect(result.error).toBeTruthy()
    })
    it("should return result contain error message when client return non exist func name", async () => {
      const { agent, client } = createAgent()
      const tools = createTools()

      client.expression.mockImplementation(() =>
        JSON.stringify({ func: "tool3", args: { name: "tool1" } }),
      )
      const result = await agent.pickTool(tools)

      expect(result.error).toBeTruthy()
    })
  })

  describe("correction", () => {
    const createAgent = (expression?: any) => {
      const client = new MockClient(expression)
      const agent = new Agent(client)
      agent.instruct(fakePrompt).check(fakePrompt)
      return { agent, client }
    }
    it("should call client.expression with correspnding prompt when correction", async () => {
      const { agent, client } = createAgent()
      await agent.correction("wrong", "correct")
      const { prompt } = client.expression.mock.calls[0][0]

      expect(prompt).toMatchFileSnapshot("./snapshots/correction-prompt.txt")
    })
    it("should call client.expression with correspnding prompt when correctionToJSON", async () => {
      const { agent, client } = createAgent()
      await agent.correctionToJSON("wrong", "correct")
      const { prompt } = client.expression.mock.calls[0][0]

      expect(prompt).toMatchFileSnapshot(
        "./snapshots/correction-json-prompt.txt",
      )
    })

    it("should call client.expression with correspnding prompt when correctionWithSentencesRequired", async () => {
      const { agent, client } = createAgent()
      await agent.correctionWithSentencesRequired("wrong", [
        "correct1",
        "correct2",
      ])
      const { prompt } = client.expression.mock.calls[0][0]

      expect(prompt).toMatchFileSnapshot(
        "./snapshots/correction-with-sentences-required-prompt.txt",
      )
    })
  })

  describe("chat", () => {
    it("should call client.chat with message and options", async () => {
      const client = new MockClient()
      const agent = new Agent(client)
      const message = "test message"
      const options = { option1: "option1" }
      await agent.chat(message, options)

      expect(client.chat).toHaveBeenCalledWith(message, options)
    })
  })
})
