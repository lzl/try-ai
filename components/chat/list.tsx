import { useChat } from 'ai/react'

interface IProps {
  id: string
}

export default function ChatList({ id }: IProps) {
  const { messages } = useChat({ id })

  if (messages.length === 0) return null

  return (
    <ul>
      {messages.map((m) => (
        <li key={m.id}>
          {m.role}: {m.content}
        </li>
      ))}
    </ul>
  )
}
