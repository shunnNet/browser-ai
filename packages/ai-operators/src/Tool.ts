type ToolSchema = {
  name: string
  description: string
  parameters: {
    type: "object"
    properties: Record<string, any>
  }
} & Record<string, any>

type ToolFunction = () => { data: any; message: string }
type ToolValidateFunction = (args: any) => boolean

export class Tool {
  public name: string
  public func: ToolFunction
  public schema: ToolSchema
  public validate: ToolValidateFunction

  constructor(
    func: ToolFunction,
    schema: ToolSchema,
    validate?: ToolValidateFunction,
  ) {
    this.func = func
    this.schema = schema
    this.name = schema.name
    this.validate = validate || (() => true)
  }
}
