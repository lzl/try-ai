import { createBot } from '@/lib/actions/bot'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import AuthCode from '@/components/input/auth-code'

export const runtime = 'edge'

export default function Page() {
  return (
    <main className="max-w-lg p-4">
      <form action={createBot} className="flex flex-col gap-4">
        <Input type="text" name="name" placeholder="Name" />
        <Textarea name="instruction" placeholder="Instruction" />
        <AuthCode />
        <Button type="submit">submit</Button>
      </form>
    </main>
  )
}
