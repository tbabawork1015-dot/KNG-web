import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '孤独じゃないグルメ',
  description: '来訪レストラン記録アプリ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}