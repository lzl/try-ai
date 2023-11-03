import type { Metadata } from 'next'

import './globals.css'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Try AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
