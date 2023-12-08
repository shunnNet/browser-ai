# Compositions

## `useAgentConversation`
This composition function provide utilities for help building chat app.

```vue
<script setup lang="ts">
const { conversation, addAgentMessage, addMessage, rawConversation, agentWatch } =
  useAgentConversation()
</script>

<template>
  <div>
    <h1>Conversation</h1>
    <div v-for="message in conversation" :key="message.id">
      <div>{{ message.role }}: {{ message.content }}</div>
    </div>
  </div>
  <pre>
    {{ rawConversation }}
    <!-- 
      user: hello
      ai: hello
      cat: meow
      function: User logined successfully
     -->
  </pre>
  <div>
    <button @click="addMessage('user', 'hello')">Add User message</button>
    <button @click="addMessage('ai', 'hello')">Add AI message</button>
    <button @click="addMessage('cat', 'meow')">Meow</button>
    <button @click="addAgentMessage('User logined successfully')">Agent</button>
  </div>
</template>
```

- `addMessage(role, msg, name?)`: append `message` to conversation with `role`. `role` has no naming restriction. 
- `addAgentMessage`: This is not for ai message. This append a message with `role: 'function'` by default. It is useful when you want to hint AI **Something is happened**.
- `rawConversation`: For combining usage with `Vai` NL functions. This is computed result of `conversation`.

```ts
vai.check(rawConversation.value)
await vai.whichIs("user's purpose?")

// rawConversation.value
/**
 *    user: hello
      ai: hello
      cat: meow
      function: User logined successfully
 * 
 */
```

- `agentWatch`: Using vue `watch` to `addAgentMessage`. This is useful when you want to automatically add agent message base on state changed like `isLogin`.

```vue
<script setup lang="ts">
const isLogin = ref(false)
const { rawConversation, agentWatch } = useAgentConversation()
agentWatch(isLogin, (newValue, oldValue) => {
  if(newValue){
    return "User login successfully!"
  } else {
    return "User log out!"
  }
})
onMounted(() => {
  isLogin.value = true
  console.log(rawConversation.value)
  // function: User login successfully!"
})

</script>
```

## `useAgentEvent`
## `useRouterWaiter`
## `useVueElementStore`
## `useRouteStatus`
## `useCreateVai`
## `createVai`