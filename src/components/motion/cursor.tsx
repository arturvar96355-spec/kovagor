'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useGSAP } from '@gsap/react'
import { gsap, registerGsap } from '@/lib/animation'

/** Кастомный курсор: точка, увеличивается на ссылках/кнопках, показывает подпись из data-cursor. Только pointer: fine. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const pathname = usePathname()

  // после навигации курсор возвращается в обычное состояние
  useEffect(() => {
    if (label.current) label.current.textContent = ''
    if (dot.current) gsap.to(dot.current, { width: 14, height: 14, duration: 0.3, overwrite: 'auto' })
  }, [pathname])

  useGSAP(() => {
    registerGsap()
    const mm = gsap.matchMedia()
    mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const el = dot.current!
      gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0 })
      const x = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' })
      const y = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' })
      const move = (e: PointerEvent) => {
        x(e.clientX)
        y(e.clientY)
        gsap.to(el, { autoAlpha: 1, duration: 0.3, overwrite: 'auto' })
        const t = (e.target as Element | null)?.closest('a,button,[data-cursor],input,select,textarea')
        const text = t?.getAttribute('data-cursor') ?? ''
        if (label.current) label.current.textContent = text
        gsap.to(el, { width: text ? 96 : t ? 44 : 14, height: text ? 96 : t ? 44 : 14, duration: 0.35, ease: 'power3.out', overwrite: 'auto' })
      }
      const leave = () => gsap.to(el, { autoAlpha: 0, duration: 0.3 })
      window.addEventListener('pointermove', move)
      document.documentElement.addEventListener('pointerleave', leave)
      return () => {
        window.removeEventListener('pointermove', move)
        document.documentElement.removeEventListener('pointerleave', leave)
      }
    })
  })

  return (
    <div ref={dot} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90] hidden h-[14px] w-[14px] items-center justify-center rounded-full bg-paper mix-blend-difference [@media(pointer:fine)]:flex">
      <span ref={label} className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink" />
    </div>
  )
}
