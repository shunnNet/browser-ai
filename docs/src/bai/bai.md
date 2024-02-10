# `bai`
`bai` is sub-class of `Agent`. Make sure you check [Agent's documentation](../guide/agent).

`bai` is a class that can be used for interaction between Model and web pages. It works by retrieving DOM nodes in the webpage that have the `data-ai-id` attribute and including them in the prompt.

You can utilize the `bai` to find the DOM node most relevant to the conversation text.

## install

```sh
pnpm install @browser-ai/bai
```

### Via **CDN**

```html
<script src="https://unpkg.com/@browser-ai/bai/dist/umd/index.js"></script>
<script>
// Then access all features from `AiExpression`
window.Bai
window.Bai.Bai
</script>
```


## Usage
`bai` initialization is slightly different from `Agent`, it is recommended using static method `.create(client)`

```ts
import { Bai } from "@browser-ai/bai"
import { openaiClient } from "./openaiClient"

// init agent
const bai = Bai.create(openaiClient)

```

### Ask about elements
To ask about elements, you need add `data-ai-id` attributes to element.

```html
<h1 data-ai-id="title">Chatbot playground</h1>
<p data-ai-id="paragraph">This is a page can play with ai chatbot. You can play with it by the buttons below</p>
<div 
  data-ai-id="actions" 
  data-ai-description="Buttons for interact with ai"
>
    <!-- a lots of buttons.... -->
</div>
```

Then, you can collect element, and ask something to `bai` by `.whichElement()`

```ts
// collect elements with [data-ai-id]
bai.collect()

//  Add conversation as source
bai.withContext(`
User: I want to play with ai !
`, async () => {
  // element
  const element = await bai.whichElement("can fulfill user's purpose")
  // { el: div, id: 'actions', description: 'Buttons for interact with ai'}
})
```

The `.whichElement()` will return element id, description and DOM node, you can then do something (e.g: scroll to it) to the node.

```ts 
// NOTE: .scrollIntoView is WebAPI
element.el.scrollIntoView()
```

### Add ai info to element
`data-ai-id` attribute is required for agent to collect element in the page. It should be unique, and descriptive. Because `data-ai-id` is also be used as element name in prompt. So a good name may help Model known the element's usage.

There is another attribute called `data-ai-description`. Like its name, it is used to describe "What is this element for". If the node doesn't have this attribute, the description will fallback to `element.textContent()` or empty string.

```HTML
<h1 data-ai-id="title">Chatbot playground</h1>
<!-- { id: "title", description: "Chatbot playground" } -->

<div 
  data-ai-id="actions" 
  data-ai-description="Buttons for interact with ai"
> 
  <button>Click me</button>
    <!-- a lots of buttons.... -->
</div>
<!-- { id: "actions", description: "Buttons for interact with ai" } -->

```