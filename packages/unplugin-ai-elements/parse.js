import * as compiler from "vue/compiler-sfc"
import { parseHTML } from "linkedom"
export const parseByCompiler = (source) => {
  const { document } = parseHTML(source)

  return document.querySelectorAll("[data-ai-id], [v-ai]").flatMap((el) => {
    if (el.getAttribute("data-ai-id")) {
      const base = {
        id: el.getAttribute("data-ai-id"),
        description:
          el.getAttribute("data-ai-description") || el.textContent || "",
        type: "element",
        data: {
          type: "predefined",
        },
      }
      if (el.getAttribute("data-ai-route")) {
        base.data.route = el.getAttribute("data-ai-route")
      }
      return [base]
    } else {
      const vai = el.getAttribute("v-ai")
      const id = vai.match(
        /(id)\s*:\s*(?:(?<quote>['"]))(?<value>[^']+)\k<quote>/,
      )?.groups.value

      const desc = vai.match(
        /(description)\s*:\s*(?:(?<quote>['"]))(?<value>[^']+)\k<quote>/,
      )?.groups.value

      const route = vai.match(
        /(route)\s*:\s*(?:(?<quote>['"]))(?<value>[^']+)\k<quote>/,
      )?.groups.value

      if (!id) {
        return []
      } else {
        const base = {
          id,
          description: desc || el.textContent || "",
          type: "element",
          data: {
            type: "predefined",
          },
        }
        if (route) {
          base.data.route = route
        }
        return [base]
      }
    }
  })
}

export const parseVueSFC = (code) => {
  const parsedContent = compiler.parse(code)
  return parsedContent.descriptor.template
    ? parseByCompiler(parsedContent.descriptor.template.content)
    : []
}
