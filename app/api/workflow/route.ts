import { NextRequest, NextResponse } from 'next/server'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

import { IConfig } from '@/lib/types'
import { checkCode } from '@/lib/utils'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_PATH,
})

// gpt-3.5-turbo-1106
// gpt-4-1106-preview
const model = 'gpt-4-1106-preview'

export async function POST(req: NextRequest) {
  try {
    const { code, config, messages: _messages } = await req.json()

    if (!checkCode(code)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid code' },
        { status: 403 }
      )
    }

    // TODO: validate config with zod

    const { variables, workflow } = config as IConfig

    const systemMessages = []

    const currentStep = workflow[0]
    if (currentStep.system_prompt) {
      let instruction = `${currentStep.system_prompt}`
      if (currentStep.system_prompt.includes('{required_variables}')) {
        let variables_text = ''
        if (currentStep.required_variables) {
          const required_variables = variables.filter(
            (v) => currentStep.required_variables?.includes(v.key)
          )
          variables_text += `${JSON.stringify(required_variables)}`
        }
        console.log('variables_text:', variables_text)
        if (variables_text) {
          instruction = instruction.replace(
            '{required_variables}',
            variables_text
          )
        }
      }
      console.log('instruction:', instruction)
      systemMessages.push({
        role: 'system',
        content: instruction,
      })
    }

    if (systemMessages.length === 0) {
      systemMessages.push({
        role: 'system',
        content: 'You are ChatGPT, a large language model trained by OpenAI.',
      })
    }

    const messages = [...systemMessages, ..._messages]

    console.log('messages:', messages)

    const response = await openai.chat.completions.create({
      model,
      stream: true,
      messages,
    })

    const stream = OpenAIStream(response)

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 }
    )
  }
}
