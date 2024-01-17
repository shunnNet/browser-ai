// TODO: why this line will break the type check?
// import type { Item } from "@browser-ai/vai"

declare module "virtual:ai-elements" {
  const contents: Record<string, Item>
  export default contents
}
