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
