'use server'

import { revalidatePath } from 'next/cache'
import { kv } from '@vercel/kv'

import { type Chat } from '@/lib/types'
import { checkCode } from '@/lib/utils'

export async function getChat(id: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)
  return chat || { id, messages: [] }
}

export async function clearChat(formData: FormData) {
  const code = formData.get('code') as string
  if (!checkCode(code)) {
    return { error: 'Invalid code' }
  }
  const id = formData.get('id') as string
  try {
    await kv.del(`chat:${id}`)
  } catch (error) {
    console.log('clearChat error:', error)
  } finally {
    const path = formData.get('path') as string
    revalidatePath(path ?? '/')
  }
}
