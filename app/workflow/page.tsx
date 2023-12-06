'use client'

import * as React from 'react'
import { Message } from 'ai'
import { useChat } from 'ai/react'
import { useImmer } from 'use-immer'

import { IConfig } from '@/lib/types'
import { getCode } from '@/lib/utils'
import { safePartialParse } from '@/lib/utils/parser'
import ChatInput from '@/components/chat/input'
import Markdown from '@/components/chat/markdown'

import CONFIG from './config.json'

const code = getCode()

export default function Page() {
  return (
    <div className="p-4">
      <Chat />
    </div>
  )
}

function Chat() {
  const [config, setConfig] = useImmer<IConfig>(CONFIG)
  console.log('config:', config)

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

  const latestAssistantResponse = React.useMemo(() => {
    const f = messages.filter((m) => m.role === 'assistant')
    return f[f.length - 1]?.content
  }, [messages])

  const currentWorkflowStep = React.useMemo(() => {
    return config.workflow.find((w) => !w.done)
  }, [config])

  React.useEffect(() => {
    const json = safePartialParse(latestAssistantResponse)
    if (json) {
      const { variables, done } = json
      if (variables && variables.length > 0) {
        setConfig((draft) => {
          variables.forEach((v: any) => {
            const idx = draft.variables.findIndex((c) => c.key === v.key)
            if (idx > -1) {
              draft.variables[idx].value = v.value
            }
          })
        })
      }
      if (done) {
        setConfig((draft) => {
          const idx = draft.workflow.findIndex((w) => !w.done)
          if (idx > -1) {
            draft.workflow[idx].done = true
          }
        })
      }
    }
  }, [latestAssistantResponse, setConfig])

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 flex flex-col gap-4 rounded-md border p-4">
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          append={append}
          setInput={setInput}
          isLoading={isLoading}
        />
        <ChatList messages={messages} />
      </div>
      <div className="col-span-1 flex flex-col gap-4">
        <div>Done: {currentWorkflowStep?.done ? '✅' : '❌'}</div>
        <div className="border p-4">
          <pre className="overflow-auto">
            {JSON.stringify(config.variables, null, 2)}
          </pre>
        </div>
      </div>
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

function ChatContent({ content }: { content: string }) {
  const json = safePartialParse(content)

  if (json) {
    const { assistant_response } = json
    if (assistant_response) {
      return <Markdown>{assistant_response}</Markdown>
    }
  }

  if (content.startsWith('{')) return null

  return <Markdown>{content}</Markdown>
}
