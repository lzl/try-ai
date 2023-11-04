'use client'

import ChatInput from './input'
import ChatList from './list'

interface IProps {
  id: string
}

export default function Chat({ id }: IProps) {
  return (
    <div className="flex flex-col gap-4 rounded-md border p-4">
      <ChatList id={id} />
      <ChatInput id={id} />
    </div>
  )
}
