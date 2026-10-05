import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { SmoothScroll } from '@/components/motion/smooth-scroll'
import { Cursor } from '@/components/motion/cursor'
import { Preloader } from '@/components/motion/preloader'
import './globals.css'

const display = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})
const sans = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-sans', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kovagor.ru'),
  title: 'KOVAGOR — сайты под ключ',
  description: 'KOVAGOR создаёт сайты под ключ: дизайн, анимации, разработка и запуск.',
}

export const viewport: Viewport = { themeColor: '#f4f1ea' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${sans.variable}`}>
      <body>
        <Preloader />
        <Cursor />
        <SmoothScroll />
        {children}
      </body>
    </html>
  )
}
