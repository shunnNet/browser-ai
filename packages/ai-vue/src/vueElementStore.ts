import { ElementStore, ElementStoreItem } from "@browser-ai/ai-operators"
import { VNode } from "vue"

export type VueElementStoreItem = ElementStoreItem & {
  el: HTMLElement
  vnode: VNode
}

export const vueElementStore = new ElementStore<VueElementStoreItem>()
