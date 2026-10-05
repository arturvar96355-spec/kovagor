import Link from 'next/link'
import { site } from '@/content/site'
import { footerRequisites } from '@/content/legal'
import { CookieSettingsButton } from './cookie-settings-button'
import { SplitReveal } from './motion/split-reveal'

export function Footer() {
  return (
    <footer className="overflow-hidden bg-ink px-[clamp(20px,4vw,64px)] pb-10 pt-6 text-paper">
      <div aria-hidden>
        <SplitReveal by="words" className="mx-auto max-w-7xl select-none text-center font-display text-[clamp(4rem,19vw,17rem)] leading-[0.85] tracking-[0.06em] text-paper/[0.08]">
          KOVAGOR
        </SplitReveal>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-wrap lg:pr-[clamp(0px,14vw,240px)] items-center justify-between gap-4 border-t border-paper/15 pt-8 text-sm opacity-70">
        <p>© {new Date().getFullYear()} {site.name}{footerRequisites() ? ` · ${footerRequisites()}` : ''}</p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/privacy" className="hover:underline">Политика конфиденциальности</Link>
          <Link href="/consent" className="hover:underline">Согласие на обработку данных</Link>
          <Link href="/cookies" className="hover:underline">Cookie</Link>
          <Link href="/offer" className="hover:underline">Оферта</Link>
          <CookieSettingsButton />
        </nav>
      </div>
    </footer>
  )
}
