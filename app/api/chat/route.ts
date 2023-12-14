import { NextRequest, NextResponse } from 'next/server'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

import { IConfig } from '@/app/config'

export const runtime = 'edge'

const model = 'gpt-4-1106-preview'

export async function POST(req: NextRequest) {
  try {
    const { config, messages: _messages } = await req.json()

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const { variables, workflow } = config as IConfig

    const systemMessages = []
    let enabledJsonMode = false

    const currentStep = workflow.find((w) => !w.done)
    if (currentStep && currentStep.system_prompt) {
      let instruction = `${currentStep.system_prompt}`

      if (instruction.includes('{required_variables}')) {
        let variables_text = ''
        if (currentStep.required_variables) {
          const required_variables = variables.filter(
            (v) => currentStep.required_variables?.includes(v.key)
          )
          variables_text += `${JSON.stringify(required_variables)}`
        }
        if (variables_text) {
          instruction = instruction.replace(
            '{required_variables}',
            variables_text
          )
        }
      }

      for (const v of variables) {
        const key = `{${v.key}}`
        const find = instruction.includes(key)
        if (find) {
          instruction = instruction.replaceAll(key, JSON.stringify(v.value))
        }
      }

      systemMessages.push({
        role: 'system',
        content: instruction,
      })
      enabledJsonMode = true
    }

    if (systemMessages.length === 0) {
      systemMessages.push({
        role: 'system',
        content: 'You are ChatGPT, a large language model trained by OpenAI.',
      })
    }

    const messages = [...systemMessages, ..._messages]

    const response = await openai.chat.completions.create({
      model,
      stream: true,
      messages,
      response_format: {
        type: enabledJsonMode ? 'json_object' : 'text',
      },
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
