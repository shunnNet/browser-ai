// TODO: re export prompt funciton from expression?

export function WHICH_ROUTE(description: string) {
  return `Which route ${description}? You must answer by only route id with no other words. If no appropriate route, say 'no', and the other agent will navigate user to other place.`
}
