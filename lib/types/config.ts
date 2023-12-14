export interface IConfig {
  version: number
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
  done?: boolean
}
