'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger, registerGsap, NO_REDUCED_MOTION } from '@/lib/animation'

/** Тонкая линия прогресса прокрутки под шапкой. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    registerGsap()
    const mm = gsap.matchMedia()
    mm.add(NO_REDUCED_MOTION, () => {
      const st = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => gsap.set(bar.current, { scaleX: self.progress }),
      })
      return () => st.kill()
    })
  })
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-ink" />
    </div>
  )
}
