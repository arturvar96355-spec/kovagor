'use client'

import { useRef, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, registerGsap } from '@/lib/animation'

/** Элемент слегка «притягивается» к курсору. Только для pointer: fine. */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      registerGsap()
      const el = ref.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' })
        const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          x((e.clientX - (r.left + r.width / 2)) * strength)
          y((e.clientY - (r.top + r.height / 2)) * strength)
        }
        const leave = () => {
          x(0)
          y(0)
        }
        el.addEventListener('pointermove', move)
        el.addEventListener('pointerleave', leave)
        return () => {
          el.removeEventListener('pointermove', move)
          el.removeEventListener('pointerleave', leave)
        }
      })
    },
    { scope: ref },
  )

  return (
    <span ref={ref} className="inline-block">
      {children}
    </span>
  )
}
