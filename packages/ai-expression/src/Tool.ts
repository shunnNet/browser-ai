export type ToolSchema = {
  name: string
  description: string
  parameters: {
    type: "object"
    properties: Record<string, any>
  } & Record<string, any>
} & Record<string, any>

export type ToolFunction<
  T extends ToolFunctionParams = ToolFunctionParams,
  R = any,
> = (args: T) => R

export type ToolValidateFunction = (args: ToolFunctionParams) => boolean

export type ToolFunctionParams = Record<string, any>
export class Tool<T extends ToolFunctionParams = ToolFunctionParams, R = any> {
  public name: string
  public func: ToolFunction<T, R>
  public schema: ToolSchema
  public validate: ToolValidateFunction

  constructor(
    func: ToolFunction<T, R>,
    schema: ToolSchema,
    validate?: ToolValidateFunction,
  ) {
    this.func = func
    this.schema = schema
    this.name = schema.name
    this.validate = validate || (() => true)
  }
}
