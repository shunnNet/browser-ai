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
})
