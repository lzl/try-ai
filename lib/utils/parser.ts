import { parse as bestEffortJsonParse } from 'best-effort-json-parser'

export function safePartialParse(str: string, defaultValue: any = null) {
  try {
    return bestEffortJsonParse(str)
  } catch (e) {
    return defaultValue
  }
}
