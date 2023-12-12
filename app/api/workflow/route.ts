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
const model = 'gpt-3.5-turbo-1106'

const variable_rules = `[IMPORTANT] return in json mode.

json structure:

{ "assistant_response": "your response", "variables": {required_variables}, "done": false|true }

here is the rules:

- 'assistant_response' is the COMPLETE response you want to return to the user, do not end the response with semicolon.
- 'variables' is the list of variables and the 'value' field should be filled based on the info collected from user and your correction (but not from your question).
- only the variables related with last two messages should be put into 'variables'.
- remove description field from 'variables' before response.
- remove the item from 'variables' which 'value' field is empty (such as empty string or array) before response.
- 'done' is a boolean value, true means all of the steps are completed, false means there are some steps not completed.
- check the rules again before response.`

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
    let enabledJsonMode = false

    const currentStep = workflow.find((w) => !w.done)
    if (currentStep && currentStep.system_prompt) {
      let instruction = `${currentStep.system_prompt}` + variable_rules
      if (instruction.includes('{required_variables}')) {
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

      for (const v of variables) {
        const key = `{${v.key}}`
        const find = instruction.includes(key)
        if (find) {
          instruction = instruction.replaceAll(key, JSON.stringify(v.value))
        }
      }

      console.log('instruction:', instruction)
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

    console.log('systemMessages:', systemMessages)

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
