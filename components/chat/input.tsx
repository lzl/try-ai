import * as React from 'react'
import type { ChatRequestOptions, CreateMessage, Message } from 'ai'
import { Loader2Icon } from 'lucide-react'

import TextareaAutosize from '@/components/ui/textarea-autosize'

interface IProps {
  input: string
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>
  setInput: React.Dispatch<React.SetStateAction<string>>
  isLoading: boolean
  placeholder?: string
}

export default function ChatInput({
  input,
  handleInputChange,
  append,
  setInput,
  isLoading,
  placeholder,
}: IProps) {
  const onSubmit = (content: string) => {
    const q = content.trim()
    if (q === '' || isLoading) return
    append({
      role: 'user',
      content: q,
    })
    setInput('')
  }

  return (
    <div className="relative">
      <TextareaAutosize
        input={input}
        onInput={handleInputChange}
        handleSubmit={onSubmit}
        placeholder={placeholder}
      />
      {isLoading && (
        <div className="absolute right-2 top-0 flex h-10 items-center text-slate-400">
          <Loader2Icon className="animate-spin" />
        </div>
      )}
    </div>
  )
}
