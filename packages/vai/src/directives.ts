import { Directive } from "vue"
import { VueItemStore } from "./vueItemStore"

type VAiBinding = {
  id: string
  description: string
}

export const useVaiDirective = (vueItemStore: VueItemStore) => {
  // https://stackoverflow.com/questions/71184825/typing-custom-directives
  const vAi = <Directive<HTMLElement, VAiBinding>>{
    created(el, binding, vnode) {
      const id = binding.value.id
      const description = binding.value.description || el?.textContent || ""

      el.dataset[`aiId`] = id
      el.dataset[`aiDescription`] = description

      vueItemStore.setItemById(
        id,
        vueItemStore.createVueItem(id, description, { el, vnode }),
      )
    },
    beforeUpdate(el, binding, vnode) {
      const id = binding.value.id
      const description = binding.value.description || el?.textContent || ""

      el.dataset[`aiId`] = id
      el.dataset[`aiDescription`] = description

      if (binding.oldValue && binding.oldValue.id !== id) {
        vueItemStore.deleteItemById(binding.oldValue.id)
      }
      vueItemStore.setItemById(
        id,
        vueItemStore.createVueItem(id, description, { el, vnode }),
      )
    },
    beforeUnmount(el) {
      const id = el.dataset["aiId"] as string
      vueItemStore.deleteItemById(id)
    },

    // TODO: description using textContent will not work for SSR
    getSSRProps(binding) {
      return {
        "data-ai-id": binding.value.id,
        "data-ai-description": binding.value.description,
      }
    },
  }

  return vAi
}
