'use client'

import * as React from 'react'

import TextareaAutosize from '@/components/ui/textarea-autosize'

export default function ChatInput() {
  const [query, setQuery] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const onSubmit = (content: string) => {
    const q = content.trim()
    if (q === '') return
    setIsLoading(true)
    console.log('query:', q)
    setQuery('')
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-x-2 bottom-2">
      <TextareaAutosize value={query} setValue={setQuery} onSubmit={onSubmit} />
    </div>
  )
}
