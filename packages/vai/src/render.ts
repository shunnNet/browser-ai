import {
  computeFormatHint as richCompute,
  ComponentOption,
} from "@crazydos/vue-llm-rich-message"

export type VaiComputeFormatHintOptions =
  | ComponentOption[]
  | {
      vai: ComponentOption
    }[]

// TODO: support vue component type DefineComponent<{}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<{}>>, {}, {}>
export const computeFormatHint = (
  components: VaiComputeFormatHintOptions | any[],
) => {
  const _components = components.map((component) => {
    if ("vai" in component) {
      return component.vai
    }
    return component
  })
  return richCompute(_components)
}

export { ComponentMessage } from "@crazydos/vue-llm-rich-message"
export type { ComponentOption } from "@crazydos/vue-llm-rich-message"
