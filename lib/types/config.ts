export interface IConfig {
  version: 0
  variables: IVariable[]
  workflow: IStep[]
}

export interface IVariable {
  key: string
  description: string
  value: any
}

export interface IStep {
  system_prompt: string
  required_variables?: string[]
}
