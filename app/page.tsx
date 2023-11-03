import ChatInput from '@/components/chat/input'

export const runtime = 'edge'

export default function RootPage() {
  return (
    <main className="p-2">
      <h1>AI</h1>
      <ChatInput />
    </main>
  )
}
