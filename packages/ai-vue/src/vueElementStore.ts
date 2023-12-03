import { ElementStore, ElementStoreItem } from "@browser-ai/ai-statements"
import { VNode } from "vue"

export type VueElementStoreItem = ElementStoreItem & {
  el: HTMLElement
  vnode: VNode
}

export type VueElementStore = ElementStore<VueElementStoreItem>

export const createVueElementStore: () => VueElementStore = () =>
  new ElementStore<VueElementStoreItem>()
