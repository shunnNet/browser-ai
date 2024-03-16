import { expect, vi, describe, it, beforeEach, Mock } from "vitest"
import { Agent } from "../src/Agent"

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
})
