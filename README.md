# Browser AI
**Not stable. Still working on it...**

This is a tool library for developing AI web applications at browser side, especially tailored for business applications that require compliance with rules.

This library can assist you in:

- Integrating LLM functionality with business logic.
- Translating user natural language into UI actions or executing specific functions.
- Navigating and guiding users.

Please also refer to the conceptual demonstration repository  [ai-vue-concept](https://github.com/shunnNet/ai-vue-concept).

## Features
- **Simple**: No complicate setting or parameters.
- **Atomic**: Atomic-level natural language functions. (`.is()`, `.whichIs()`, etc.)
- **Framework integration**: (Vue only currently):
  - Easily annotate node, routing information and incorporate prompts
  - Render component in LLM message
- **Typed**: Support Typescript.

:::warning
The expected use of this library is to securely handle the connection to the language model on the server side to prevent API key exposure. So, it is not recommended to connect LLM directly in browser. Alternatively, running the language model directly in the browser is also an option.
:::

## Why
Please refer to [Why](./why)

## Documentation

## Contribute
...preparing