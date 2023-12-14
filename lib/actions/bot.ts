'use server'

import { kv } from '@vercel/kv'

import { type Bot } from '@/lib/types'
import { checkCode, nanoid } from '@/lib/utils'

export async function createBot(formData: FormData) {
  const code = formData.get('code') as string
  if (!checkCode(code)) {
    return { error: 'Invalid code' }
  }

  const id = nanoid()
  const name = formData.get('name') as string
  const instruction = formData.get('instruction') as string
  const payload = { id, name, instruction }
  try {
    await kv.hmset(`bot:${id}`, payload)
  } catch (error) {
    console.log('createBot error:', error)
  }
}

export async function getBot(id: string) {
  const bot = await kv.hgetall<Bot>(`bot:${id}`)
  return bot || { id, name: '', instruction: '' }
}
