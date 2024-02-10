import { Directive } from "vue"
import { ItemStore, createItem } from "@browser-ai/bai"

type VAiBinding = {
  id: string
  description: string
}

export const useVaiDirective = (itemStore: ItemStore) => {
  // https://stackoverflow.com/questions/71184825/typing-custom-directives
  const vAi = <Directive<HTMLElement, VAiBinding>>{
    created(el, binding, vnode) {
      const id = binding.value.id
      const description = binding.value.description || el?.textContent || ""

      el.dataset[`aiId`] = id
      el.dataset[`aiDescription`] = description

      itemStore.setItemById(
        id,
        createItem(id, description, "element", {
          el,
          vnode,
        }),
      )
    },
    beforeUpdate(el, binding, vnode) {
      const id = binding.value.id
      const description = binding.value.description || el?.textContent || ""

      el.dataset[`aiId`] = id
      el.dataset[`aiDescription`] = description

      if (binding.oldValue && binding.oldValue.id !== id) {
        itemStore.deleteItemById(binding.oldValue.id)
      }
      itemStore.setItemById(
        id,
        createItem(id, description, "element", {
          el,
          vnode,
        }),
      )
    },
    beforeUnmount(el) {
      const id = el.dataset["aiId"] as string
      itemStore.deleteItemById(id)
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
