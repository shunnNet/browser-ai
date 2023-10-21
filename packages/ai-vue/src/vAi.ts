import { Directive } from "vue"
import { vueElementStore } from "./vueElementStore"

type VAiBinding = {
  id: string
  description: string
}

// https://stackoverflow.com/questions/71184825/typing-custom-directives
export const vAi = <Directive<HTMLElement, VAiBinding>>{
  created(el, binding, vnode) {
    const id = binding.value.id
    const description = binding.value.description

    el.dataset[`aiId`] = id
    el.dataset[`aiDescription`] = description

    vueElementStore.setElementById(id, { ...binding.value, el, vnode })
  },
  beforeUpdate(el, binding, vnode) {
    const id = binding.value.id
    const description = binding.value.description

    el.dataset[`aiId`] = id
    el.dataset[`aiDescription`] = description

    if (binding.oldValue && binding.oldValue.id !== id) {
      vueElementStore.deleteElementById(binding.oldValue.id)
    }
    vueElementStore.setElementById(id, { ...binding.value, el, vnode })
  },
  beforeUnmount(el) {
    const id = el.dataset["aiId"] as string
    vueElementStore.deleteElementById(id)
  },

  getSSRProps(binding) {
    return {
      "data-ai-id": binding.value.id,
      "data-ai-description": binding.value.description,
    }
  },
}
