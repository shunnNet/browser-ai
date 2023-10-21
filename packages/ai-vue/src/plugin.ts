import { Plugin } from "vue"
import { vAi } from "./vAi"

export default {
  install(app) {
    app.directive("ai", vAi)
  },
} as Plugin
