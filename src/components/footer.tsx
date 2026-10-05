import Link from 'next/link'
import { site } from '@/content/site'

export function Footer() {
  return (
    <footer className="bg-ink px-[clamp(20px,4vw,64px)] pb-10 pt-6 text-paper">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-paper/15 pt-8 text-sm opacity-70">
        <p>© {new Date().getFullYear()} {site.name}</p>
        <nav className="flex gap-6">
          <Link href="/privacy" className="hover:underline">Политика конфиденциальности</Link>
          <Link href="/cookies" className="hover:underline">Cookie</Link>
          <Link href="/offer" className="hover:underline">Оферта</Link>
        </nav>
      </div>
    </footer>
  )
}
