# Why
The primary goals of this project are:

- Develop tools for building fully conversational business applications; for example, completing a purchase through chat.
- Create AI tools to assist existing websites.

The explanations will be provided based on different packages:
- `ai-expression`
- `vai`

## Why - ai-expression
> TL;DR: This package offers what I believe to be a better way to apply LLM in business logic.

I attempted to explore the possibility of running something like an LLM Agent in the browser within [ai-vue-concept](https://github.com/shunnNet/ai-vue-concept). Ideally, the LLM should automatically perform appropriate actions based on user input in natural language, guiding users through the website while adhering to business logic.

Initially, I incorporated business logic into the prompt in a manner similar to `LangChain` `ReActAgent`, combining it with changes in the user's operational state.

For example:

```ts
const systemMessage = computed(
  () => `---rules---
1. If the user is not logged in, prompt them to log in first. If the user is logged in, remind them of that fact.
2. If the user does not select any product, prompt them to select a product first.
3. The user can only do checkout if logged in and has selected a product. So for checkout:
  1. If the user is not logged in, prompt them to log in first.
  2. If the user has not selected any product, prompt them to select a product first.

4. If the user asks for checkout and can do checkout, call the 'prepareCheckoutForm' function.
`
)
```
... and so on.

I did achieve my goal, but I encountered several issues:

- As business logic becomes more complex:
  - LLM performance may suffer. How to simplify business logic?
  - How to manage business logic prompts?
- Implementing with Agent + Tool made it challenging to intervene in the automatic flow of LLM.
- The code did not look clean, and there was a high coupling between tools and business logic.

Then, I devised the method provided in this repository: **using atomic-level natural language functions to analyze natural language input and produce simple results**, such as:

```ts
const purpose = await vai.whichIs("user's purpose", ["checkout", "pick product"])
// "checkout"
```
Then I can handle it in code:

```ts
const purpose = await vai.whichIs("user's purpose", ["checkout", "pick product"])

let systemMessage = ""

switch(purpose){
  case "checkout":
    if (user.isLogin) {
      if (canCheckout) {
        prepareCheckoutForm()
        systemMessage = "We already prepared a checkout form; ask the user to fill it."
      } else {
        // prompt user to pick a product first
        systemMessage = "Ask the user to pick a product"
      }
      } else {
        prepareLoginForm()
        systemMessage = "Ask the user to log in"
    }
  case "pick product":
    const productList = prepareRecommendProduct()
    systemMessage = `We prepared a list of products; ask the user to pick one: ${productList.toPrompt()}`
    // show product
}

// and ask LLM for answers through messages
const answer = await chatCompletion(messages, systemMessage)
```

This brings some advantages:

- Similar to the traditional way of managing business logic in code.
- No need to write a separate natural language version of business logic.
- No coupling issues between tools and business logic.
- LLM doesn't have to receive a large number of business logic prompts, improving accuracy.
- Better control over LLM behavior, allowing integration with other program behaviors.

The downside is that it may require more calls to LLM (perhaps 1-2 times).

If we ensure the prompt is simple, this delay should not be too fatal (consider the delay in online chat with human customer service, which can take several minutes to respond).

I believe this approach is better for combining business logic and providing fully conversational applications, at least until AI becomes powerful enough to overcome some of these challenges.

## Why - vai
> The content below is about `Vue`, but similar concepts can be applied to `React`, `Svelte`, etc.

I pondered on how frontend frameworks like `Vue` could integrate with LLM. I referred to [`ai-jsx`](https://docs.ai-jsx.com), I believe it is more focused on generating natural language; it looked cool. However, I focused on how to use it in a business app, emphasizing some auxiliary use cases:

- Guiding users
- Informing users about events
- Presenting relevant information to users

The website is like a performance venue, and AI is the usher. Therefore, it needs to know:

- What is happening on the web page?
- Where on the site is the information the user wants?
- Relevant information that the user needs to know
- Can the user be directly guided to accomplish their goal?

For these purposes, I think it is not necessary to use a frontend framework; even raw HTML can achieve similar functionality. However, frontend frameworks provide a slight advantage.

### Obtaining Elements on the Page
I added some attributes like `data-ai-id` and `data-ai-description` to DOM elements, included them in the prompt, and they can accomplish things like:

- Guiding the user to scroll to that element
- Explaining the purpose of that element
- Describing page content
- Explaining what is happening on the page

Vue's role here is to make obtaining DOM elements a bit easier and dynamically change element states.

### Multi-page Navigation (SPA)
I added `meta.ai.id` and `meta.ai.description` to `vue-router` to describe the content of each page. Then, I included them in the prompt. If needed, LLM can select a page and navigate to it, and even further, scroll the screen to an element the user might be interested in.

### Integration with a Compiler
These two use cases mentioned above can actually collect more information during the code compilation phase, improving navigation efficiency. This part is still under research.

### Rendering Components in LLM Responses
OpenAI's response format is markdown. If we want it to integrate better with website components, we need the ability to render Vue components in its response (even passing state, inserting custom content, etc.). I created [vue-llm-rich-message](https://github.com/shunnNet/vue-llm-rich-message) to meet this requirement.