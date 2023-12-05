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
      let variables_text = ''
      if (currentStep.required_variables) {
        currentStep.required_variables.forEach((key) => {
          const variable = variables.find((v) => v.key === key)
          if (variable) {
            variables_text += `variable name: ${variable.key}\nvariable description: ${variable.description}\nvariable value: ${variable.value}\n\n`
          }
        })
      }
      console.log('variables_text:', variables_text)
      let instruction = `${currentStep.system_prompt}`
      if (variables_text) {
        instruction += `\n\n<required_variables>${variables_text}</required_variables>`
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
