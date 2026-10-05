'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ease, registerGsap } from '@/lib/animation'
import { Monogram } from '@/components/brand'

export const PRELOAD_KEY = 'kv-preloaded'

/** Короткая заставка с монограммой: показывается раз за сессию, пропускается при reduced-motion. */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      registerGsap()
      const el = root.current!
      const skip = () => {
        gsap.set(el, { display: 'none' })
      }
      let seen = false
      try { seen = sessionStorage.getItem(PRELOAD_KEY) === '1' } catch {}
      if (seen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return skip()

      const tl = gsap.timeline({
        onComplete: () => {
          skip()
          try { sessionStorage.setItem(PRELOAD_KEY, '1') } catch {}
        },
      })
      tl.from('[data-pre-mono] path', { yPercent: 40, opacity: 0, duration: 1, ease: ease.out, stagger: 0.12 })
        .to('[data-pre-mono]', { opacity: 0, duration: 0.3 }, '+=0.2')
        .to(el, { yPercent: -100, duration: 0.9, ease: ease.inOut })
    },
    { scope: root },
  )

  return (
    <div ref={root} aria-hidden className="fixed inset-0 z-[100] grid place-items-center bg-ink text-paper">
      <div data-pre-mono className="w-40 md:w-56">
        <Monogram className="w-full" />
      </div>
    </div>
  )
}
