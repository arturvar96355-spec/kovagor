'use client'

import { useRef, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ease, dur, registerGsap, NO_REDUCED_MOTION } from '@/lib/animation'

/** Появление блока при входе во viewport (fade + подъём). Дочерние [data-stagger] идут каскадом. */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      registerGsap()
      const mm = gsap.matchMedia()
      mm.add(NO_REDUCED_MOTION, () => {
        const targets = ref.current!.querySelectorAll('[data-stagger]')
        gsap.from(targets.length ? targets : ref.current, {
          opacity: 0,
          y: 40,
          duration: dur.base,
          ease: ease.out,
          delay,
          stagger: 0.12,
          scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
        })
      })
    },
    { scope: ref },
  )
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
