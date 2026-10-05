'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { site } from '@/content/site'
import { Monogram } from './brand'
import { Magnetic } from './motion/magnetic'

const EASE = [0.16, 1, 0.3, 1] as const

export function Header() {
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const lastY = useRef(0)

  // фон при прокрутке; шапка прячется при движении вниз и возвращается при движении вверх
  useEffect(() => {
    const on = () => {
      const y = window.scrollY
      setSolid(y > 40)
      if (Math.abs(y - lastY.current) > 8) {
        setHidden(y > 240 && y > lastY.current)
        lastY.current = y
      }
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  // меню на телефонах: Esc закрывает, страница под ним не прокручивается
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,padding] duration-500 ${
          solid ? 'bg-paper/85 py-3 backdrop-blur-md' : 'py-6'
        } ${hidden && !open ? '-translate-y-full' : 'translate-y-0'}`}
      >
        <div className="container-x flex items-center justify-between">
          <Link href="/#top" aria-label="KOVAGOR — на главную" className="flex items-center gap-3">
            <Monogram className="h-7 w-auto" />
            <span className="font-display text-xl tracking-[0.3em]">KOVAGOR</span>
          </Link>
          <nav aria-label="Основная" className="hidden gap-8 text-sm xl:flex">
            {site.nav.map((l) => (
              <Link key={l.href} href={l.href} className="group relative py-1">
                {l.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-500 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Magnetic strength={0.25}>
              <Link href="/#contact" data-goal="cta_header" className="rounded-full border border-ink px-5 py-2 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-paper">
                Заявка
              </Link>
            </Magnetic>
            <button
              type="button"
              aria-label="Меню"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center xl:hidden"
            >
              <span aria-hidden className="block h-px w-6 bg-ink shadow-[0_-6px_0_0_var(--color-ink),0_6px_0_0_var(--color-ink)]" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Меню"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: EASE }}
            className="fixed inset-0 z-[70] flex flex-col bg-ink px-[clamp(20px,4vw,64px)] pb-10 pt-6 text-paper xl:hidden"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-xl tracking-[0.3em]">KOVAGOR</span>
              <button type="button" autoFocus aria-label="Закрыть меню" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center text-3xl leading-none">
                ×
              </button>
            </div>
            <nav aria-label="Мобильное меню" className="mt-12 flex flex-1 flex-col gap-2">
              {site.nav.map((l, i) => (
                <motion.div key={l.href} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.07, duration: 0.7, ease: EASE }}>
                  <Link href={l.href} onClick={() => setOpen(false)} className="block border-b border-paper/15 py-4 font-display text-5xl">
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <Link href="/#contact" onClick={() => setOpen(false)} data-goal="cta_header" className="grid h-14 place-items-center rounded-full bg-paper text-xs uppercase tracking-[0.2em] text-ink">
              Оставить заявку
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
