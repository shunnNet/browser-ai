# `BrowserNavigationAgent`
`BrowserNavigationAgent` is sub-class of `Agent`. Make sure you check [Agent's documentation](./agent).

`BrowserNavigationAgent` is a class that can be used for interaction between Model and web pages. It works by retrieving DOM nodes in the webpage that have the `data-ai-id` attribute and including them in the prompt.

You can utilize the `BrowserNavigationAgent` to find the DOM node most relevant to the conversation text.

## Usage
`BrowserNavigationAgent` initialization is slightly different from `Agent`, it is recommended using static method `.create(client)`

```ts
import { BrowserNavigationAgent } from "@browser-ai/ai-expression"
import { openaiClient } from "./openaiClient"

// init agent
const agent = BrowserNavigationAgent.create(openaiClient)

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

Then, you can collect element, and ask something to `BrowserNavigationAgent` by `.whichElement()`

```ts
//  Add conversation as source
agent.check(`
User: I want to play with ai !
`)

// collect elements with [data-ai-id]
agent.collect()

// element
const element = await agent.whichElement("can fulfill user's purpose")
// { el: div, id: 'actions', description: 'Buttons for interact with ai'}
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