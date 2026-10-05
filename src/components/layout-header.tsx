'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { site } from '@/content/site'
import { Monogram } from './brand'

export function Header() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${solid ? 'bg-paper/85 py-3 backdrop-blur-md' : 'py-6'}`}>
      <div className="container-x flex items-center justify-between">
        <Link href="/#top" aria-label="KOVAGOR" className="flex items-center gap-3">
          <Monogram className="h-7 w-auto" />
          <span className="font-display text-xl tracking-[0.3em]">KOVAGOR</span>
        </Link>
        <nav className="hidden gap-9 text-sm md:flex">
          {site.nav.map((l) => (
            <Link key={l.href} href={l.href} className="group relative">
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-500 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>
        <Link href="/#contact" data-goal="cta_header" className="rounded-full border border-ink px-5 py-2 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-paper">
          Заявка
        </Link>
      </div>
    </header>
  )
}
