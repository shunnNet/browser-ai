import { Directive } from "vue"
import { ItemManipulator, createItem } from "@browser-ai/bai"

type VAiBinding = {
  id: string
  description: string
}

export const useVaiDirective = (itemManipulator: ItemManipulator) => {
  // https://stackoverflow.com/questions/71184825/typing-custom-directives
  const vAi = <Directive<HTMLElement, VAiBinding>>{
    created(el, binding, vnode) {
      const id = binding.value.id
      const description = binding.value.description || el?.textContent || ""

      el.dataset[`aiId`] = id
      el.dataset[`aiDescription`] = description

      itemManipulator.setItemById(
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
        itemManipulator.deleteItemById(binding.oldValue.id)
      }
      itemManipulator.setItemById(
        id,
        createItem(id, description, "element", {
          el,
          vnode,
        }),
      )
    },
    beforeUnmount(el) {
      const id = el.dataset["aiId"] as string
      itemManipulator.deleteItemById(id)
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
