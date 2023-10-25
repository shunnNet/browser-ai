import { computed, Ref, ref, watch, WatchSource } from "vue"

type AgentConversationMessage = {
  role: string
  content: string
  name?: string
} & Record<string, any>

export const useAgentConversation = () => {
  const conversation: Ref<AgentConversationMessage[]> = ref([])

  const addAgentMessage = (message: string, name: string = "agent") => {
    conversation.value.push({
      role: "function",
      content: message,
      name,
    })
  }
  const addMessage = (role: string, message: string, name?: string) => {
    const payload: AgentConversationMessage = {
      role,
      content: message,
    }
    if (name) {
      payload.name = name
    }
    conversation.value.push(payload)
  }

  const agentWatch = (
    source: WatchSource,
    message: (value: any, oldValue: any) => string | string,
  ) => {
    return watch(source, (value: any, oldValue: any) => {
      const msg =
        typeof message === "function" ? message(value, oldValue) : message
      addAgentMessage(msg)
    })
  }

  const rawConversation = computed(() => {
    return conversation.value
      .map((dialog) => `${dialog.name || dialog.role}: ${dialog.content}`)
      .join("\n")
  })

  return {
    conversation,
    addMessage,
    addAgentMessage,
    agentWatch,
    rawConversation,
  }
}
