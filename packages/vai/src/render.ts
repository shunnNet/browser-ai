import {
  computeFormatHint as richCompute,
  ComponentOption,
} from "@crazydos/vue-llm-rich-message"
import { Item } from "@browser-ai/ai-expression"

export type VaiComponentOption = Pick<Item, "id" | "description"> &
  Pick<ComponentOption, "attributes">

export type VaiComputeFormatHintOptions =
  | VaiComponentOption[]
  | {
      vai: VaiComponentOption
    }[]

// TODO: support vue component type DefineComponent<{}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<{}>>, {}, {}>
export const computeFormatHint = (
  components: VaiComputeFormatHintOptions | any[],
) => {
  const _components = components.map((component) => {
    let c = component
    if ("vai" in component) {
      c = component.vai
    }
    return {
      component: c.id,
      description: c.description,
      ...(c.attributes ? { attributes: c.attributes } : {}),
    }
  })
  return richCompute(_components)
}

export { ComponentMessage } from "@crazydos/vue-llm-rich-message"
export type { ComponentOption } from "@crazydos/vue-llm-rich-message"
