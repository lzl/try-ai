import { type Message } from 'ai'

export interface Chat extends Record<string, any> {
  id: string
  messages: Message[]
  summary?: string
}
