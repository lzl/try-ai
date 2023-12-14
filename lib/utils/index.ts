import { clsx, type ClassValue } from 'clsx'
import { customAlphabet } from 'nanoid'
import { twMerge } from 'tailwind-merge'

export const isServer = () => typeof window === 'undefined'

export const getCode = () => (!isServer() && localStorage.getItem('code')) || ''

export function checkCode(code: string) {
  const isValid = process.env.CODE?.split(',').includes(code)
  return isValid
}

// https://planetscale.com/blog/why-we-chose-nanoids-for-planetscales-api
export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  12
) // 12-character random string

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
