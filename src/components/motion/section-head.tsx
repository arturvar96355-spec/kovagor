'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ease, registerGsap, NO_REDUCED_MOTION } from '@/lib/animation'
import { SplitReveal } from './split-reveal'

/** Заголовок секции: номер и подпись, линия «прорисовывается» на всю ширину, крупный заголовок выезжает из-под маски. */
export function SectionHead({ index, label, title, dark = false }: { index: string; label: string; title: string; dark?: boolean }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      registerGsap()
      const mm = gsap.matchMedia()
      mm.add(NO_REDUCED_MOTION, () => {
        const st = { trigger: root.current, start: 'top 85%', once: true }
        gsap.from('[data-head-line]', { scaleX: 0, transformOrigin: 'left', duration: 1.4, ease: ease.inOut, scrollTrigger: st })
        gsap.from('[data-head-meta]', { opacity: 0, y: 10, duration: 0.8, ease: ease.soft, stagger: 0.1, delay: 0.2, scrollTrigger: st })
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="mb-16 md:mb-24">
      <div className={`mb-6 flex items-center gap-5 text-xs uppercase tracking-[0.35em] ${dark ? 'text-paper/60' : 'text-mute'}`}>
        <span data-head-meta className="font-display text-base tracking-normal">{index}</span>
        <span data-head-line aria-hidden className={`h-px flex-1 ${dark ? 'bg-paper/20' : 'bg-line'}`} />
        <span data-head-meta>{label}</span>
      </div>
      <SplitReveal as="h2" className="font-display text-[clamp(2.6rem,6vw,6rem)] leading-[1.02]">
        {title}
      </SplitReveal>
    </div>
  )
}
