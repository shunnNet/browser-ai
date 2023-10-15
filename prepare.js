// prepare.js
// prepare will run right after pnpm/npm install
const isCi = process.env.CI !== undefined
// prevent install husky
if (!isCi) {
  console.log("install husky hook")
  console.log("this will configure git config core.hooksPath to .husky")
  require("husky").install()
}
