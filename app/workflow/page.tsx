'use client'

import * as React from 'react'
import { Message } from 'ai'
import { useChat } from 'ai/react'

import { IConfig } from '@/lib/types'
import { getCode } from '@/lib/utils'
import { safePartialParse } from '@/lib/utils/parser'
import ChatInput from '@/components/chat/input'
import Markdown from '@/components/chat/markdown'

const code = getCode()

export default function Page() {
  return (
    <div className="max-w-lg p-4">
      <Chat />
    </div>
  )
}

const CONFIG: IConfig = {
  version: 0,
  variables: [
    {
      key: 'job_description',
      description:
        'the description of the position user want to simulate an interview for',
      value: '',
    },
    {
      key: 'resume',
      description: 'the resume of the candidate',
      value: '',
    },
    {
      key: 'assessment_abilities',
      description: 'the list of assessment abilities for this position',
      value: [],
    },
    {
      key: 'difficulty_level',
      description: 'the difficulty level of the questions',
      value: '',
    },
    {
      key: 'number_of_questions',
      description: 'the number of questions',
      value: '',
    },
    {
      key: 'interviewing_style',
      description: `the interviewer's interviewing style`,
      value: '',
    },
    {
      key: 'questions_list',
      description: 'the list of questions',
      value: [],
    },
  ],
  workflow: [
    {
      system_prompt: `You are an HR professional, and it is now necessary to collect users' interview configuration information. This information is required to arrange a customized interview for them. Please strictly follow the steps below, and note that you should only perform one step at a time.
Step 1 - Send a greeting, the content of which is: "Hello, welcome to the customized interview. We will ask you a few questions and tailor the interview according to your responses. This process will take approximately 3 minutes. Are you ready?" The user must reply with a positive response such as 'ready' to move to the next step.
Step 2 - Guide the user to input the information of the position they want to simulate an interview for. Inform the user that they can enter text or upload an image file. The user must enter the position information to proceed to the next step.
Step 3 - Direct the user to input their resume information, telling them they can enter text or upload an image file. If the user is unwilling, they may skip this step.
Step 4 - Identify the position information input by the user in the first step, and generate 7 assessment abilities for this position, each followed by an explanation. The user must choose at least 3 assessment abilities to proceed to the next step.
Step 5 - Guide the user to choose the number of questions, with the options being 5 questions (about 5-8 minutes), 8 questions (about 8-12 minutes), 10 questions (about 12-15 minutes), or 15 questions (about 15-20 minutes). The user must select one option to proceed to the next step.
Step 6 - Guide the user to choose the difficulty level of the questions, with options being junior, intermediate, and senior. The user must select one option to move to the next step.
Step 7 - Guide the user to choose the interviewer's interviewing style, with options being friendly and open, or formal and rigorous. The user must select one option to proceed to the next step.

After all steps are completed, check whether the user has provided all the required information. If not, return to the corresponding step and prompt the user to provide the missing information. If all the information is provided, put all of them into 'assistant_response', return it to the user to get a confirmation.

[IMPORTANT] return in json mode.

json structure:

{ "assistant_response": "your response", "variables": {required_variables}, "done": false|true }

here is the rules:

- 'assistant_response' is the COMPLETE response you want to return to the user, do not end the response with semicolon.
- 'variables' is the list of variables and the 'value' field should be filled based on the info collected from user and your correction (but not from your question).
- remove description field from 'variables' before response.
- remove the item from 'variables' which 'value' field is empty (such as empty string or array) before response.
- 'done' is a boolean value, true means the user has confirmed the response, false means the user has not confirmed the response.
- check the rules again before response.`,
      required_variables: [
        'job_description',
        'resume',
        'assessment_abilities',
        'difficulty_level',
        'number_of_questions',
        'interviewing_style',
      ],
    },
  ],
}

function Chat() {
  const [config, setConfig] = React.useState(CONFIG)

  const { messages, input, handleInputChange, append, setInput, isLoading } =
    useChat({
      id: 'workflow',
      api: '/api/workflow',
      body: {
        code,
        config,
      },
      onError: (err) => {
        alert(err.message)
      },
    })

  return (
    <div className="flex flex-col gap-4 rounded-md border p-4">
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        append={append}
        setInput={setInput}
        isLoading={isLoading}
      />
      <ChatList messages={messages} />
    </div>
  )
}

function ChatList({ messages }: { messages: Message[] }) {
  if (messages.length === 0) return null

  return (
    <ul className="flex flex-col-reverse gap-8">
      {messages.map((m, idx) => (
        <li key={idx}>
          <strong>{m.role}:</strong>
          <div className="prose">
            <ChatContent content={m.content} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function ChatContent({ content }: { content: any }) {
  const json = safePartialParse(content)

  if (json) {
    const { assistant_response } = json
    return <Markdown>{assistant_response}</Markdown>
  }

  return <Markdown>{content}</Markdown>
}
