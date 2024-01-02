import { ItemStore } from "@browser-ai/bai"
import type { DOMItem } from "@browser-ai/bai"
import { VNode } from "vue"

export type VueDOMItem = DOMItem & {
  data: {
    vnode: VNode
  } & Record<string, any>
}

export class VueItemStore extends ItemStore<VueDOMItem> {
  createVueItem(
    id: string,
    description: string,
    data: VueDOMItem["data"],
  ): VueDOMItem {
    return this.createItem(id, description, "HTMLElement", data) as VueDOMItem
  }
}

export const createVueItemStore = () => new VueItemStore()
