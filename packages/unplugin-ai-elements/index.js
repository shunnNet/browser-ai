import { createUnplugin } from "unplugin"
import fg from "fast-glob"
import { readFile } from "node:fs/promises"
import { parseVueSFC } from "./parse.js"

const VIRTUAL_MODULE = "virtual:ai-elements"
const resolvedVirtualModuleId = "\0" + VIRTUAL_MODULE

export default createUnplugin((options) => {
  const includes = options?.includes || ["**/*.vue"]
  return {
    name: "unplugin-vai",
    resolveId(id) {
      if (id === VIRTUAL_MODULE) {
        return resolvedVirtualModuleId
      }
    },

    async load(id) {
      const files = await fg(includes, { dot: true })
      const codes = await Promise.all(files.map((f) => readFile(f, "utf-8")))
      const result = codes
        .flatMap((code) => parseVueSFC(code))
        .reduce((acc, now) => {
          return { ...acc, [now.id]: now }
        }, {})

      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(result)}`
      }
    },
  }
})
