export type TPromptTemplate = (...args: any[]) => string

export type TPromptTemplateDiction = {
  BASE: TPromptTemplate
  YES_NO: TPromptTemplate
  CHOICES: TPromptTemplate
  ITEMS: TPromptTemplate
  EVENT: TPromptTemplate
  SUGGEST_ACTIONS: TPromptTemplate
  ELEMENTS: TPromptTemplate
  ELEMENT: TPromptTemplate
  PICK_TOOL: TPromptTemplate
  CORRECTION: TPromptTemplate
  CORRECTION_CHOICES: TPromptTemplate
  CORRECTION_JSON: TPromptTemplate
  CORRECTION_REQUIRED_SENTENCES: TPromptTemplate
} & Record<string, TPromptTemplate>
