import { notFound } from 'next/navigation'

import { getChat } from '@/lib/actions/chat'
import Chat from '@/components/chat'

export const runtime = 'edge'

const chatId = '0'

export default async function Page({ params }: { params: { bot_id: string } }) {
  const chat = await getChat(chatId)

  if (!chat) {
    notFound()
  }

  return (
    <main className="p-4">
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <Chat
          id={chatId}
          botId={params.bot_id}
          initialMessages={chat.messages}
        />
      </div>
    </main>
  )
}
