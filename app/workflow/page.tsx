'use client'

import { useChat } from 'ai/react'

import { getCode } from '@/lib/utils'
import ChatInput from '@/components/chat/input'
import ChatList from '@/components/chat/list'

const code = getCode()

export default function Page() {
  return (
    <div className="max-w-lg p-4">
      <Chat />
    </div>
  )
}

function Chat() {
  const { messages, input, handleInputChange, append, setInput, isLoading } =
    useChat({
      id: 'workflow',
      api: '/api/workflow',
      body: {
        code,
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
