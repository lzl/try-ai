import * as React from 'react'
import { useChat } from 'ai/react'

import TextareaAutosize from '@/components/ui/textarea-autosize'

interface IProps {
  id: string
}

export default function ChatInput({ id }: IProps) {
  const { input, handleInputChange, append, setInput, isLoading } = useChat({
    id,
  })

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
    <TextareaAutosize
      input={input}
      onInput={handleInputChange}
      onSubmit={onSubmit}
    />
  )
}
