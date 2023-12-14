'use client'

import * as React from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import { Message } from 'ai'
import { useChat } from 'ai/react'
import { isArray, isEmpty } from 'lodash'
import { editor } from 'monaco-editor'
import { useImmer } from 'use-immer'

import { IConfig } from '@/lib/types'
import { getCode } from '@/lib/utils'
import { safePartialParse } from '@/lib/utils/parser'
import { Button } from '@/components/ui/button'
import ChatInput from '@/components/chat/input'
import Markdown from '@/components/chat/markdown'

import CONFIG from './config'

const code = getCode()

export default function Page() {
  return (
    <div className="min-h-screen">
      <Chat />
    </div>
  )
}

function Chat() {
  const [config, setConfig] = useImmer<IConfig>(CONFIG)

  const {
    messages,
    input,
    handleInputChange,
    append,
    setInput,
    isLoading,
    stop,
    setMessages,
  } = useChat({
    id: 'workflow',
    api: '/api/workflow',
    body: {
      code,
      config,
    },
    onFinish: (message) => {
      console.log('onFinish:', message)
    },
    onError: (err) => {
      alert(err.message)
    },
  })

  const latestAssistantResponse = React.useMemo(() => {
    const f = messages.filter((m) => m.role === 'assistant')
    return f[f.length - 1]?.content
  }, [messages])

  const filledVariables = React.useMemo(
    () => config.variables.filter((v) => !isEmpty(v.value)),
    [config.variables]
  )

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

  const editorRef = React.useRef<null | editor.IStandaloneCodeEditor>(null)
  function handleEditorDidMount(
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    editorRef.current = editor
  }

  const handleApply = React.useCallback(() => {
    stop()
    setMessages([])
    const config = editorRef.current?.getValue()
    if (config) setConfig(JSON.parse(config))
  }, [stop, setMessages, setConfig])

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <div className="col-span-1 flex flex-col gap-4">
        <Editor
          className="overflow-hidden rounded-md border"
          height="calc(100vh - 80px)"
          defaultLanguage="json"
          defaultValue={JSON.stringify(CONFIG, null, 2)}
          onMount={handleEditorDidMount}
          options={{ wordWrap: 'on' }}
        />
        <Button variant="outline" onClick={handleApply}>
          Apply Workflow
        </Button>
      </div>
      <div className="col-span-1 flex flex-col gap-4 rounded-md border p-4">
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          append={append}
          setInput={setInput}
          isLoading={isLoading}
          placeholder="Type your message here..."
        />
        <ChatList messages={messages} />
      </div>
      <div className="col-span-1 flex flex-col gap-4">
        <div className="rounded-md border p-4">
          <ol className="prose">
            {config.workflow.map((w, idx) => (
              <li key={idx} className="line-clamp-3">
                <span className="mr-2">Step {idx + 1}:</span>
                {w.done && <span className="mr-2">✅</span>}
                <span>{w.system_prompt}</span>
              </li>
            ))}
          </ol>
        </div>
        {filledVariables.length > 0 && (
          <div className="rounded-md border p-4">
            <ul className="prose">
              {filledVariables.map((v, idx) => (
                <li key={idx}>
                  <span className="mr-2 font-medium">{v.key}:</span>
                  <span>{renderVariableValue(v.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
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

  return <Markdown>{content}</Markdown>
}

function renderVariableValue(value: any) {
  if (isArray(value)) {
    return value.join(', ')
  }

  return value
}
