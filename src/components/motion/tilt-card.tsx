'use client'

import { useRef, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, registerGsap } from '@/lib/animation'

/** Карточка с лёгким 3D-наклоном за курсором и бликом, следующим за ним. Только pointer: fine, без reduced-motion. */
export function TiltCard({ children, className, max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      registerGsap()
      const el = ref.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        gsap.set(el, { transformPerspective: 900 })
        const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' })
        const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' })
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          const x = (e.clientX - r.left) / r.width
          const y = (e.clientY - r.top) / r.height
          ry((x - 0.5) * 2 * max)
          rx(-(y - 0.5) * 2 * max)
          el.style.setProperty('--gx', `${x * 100}%`)
          el.style.setProperty('--gy', `${y * 100}%`)
          el.style.setProperty('--glare', '1')
        }
        const leave = () => {
          rx(0)
          ry(0)
          el.style.setProperty('--glare', '0')
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
    <div ref={ref} className={`relative will-change-transform ${className ?? ''}`} style={{ transformStyle: 'preserve-3d' }}>
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[var(--glare,0)] transition-opacity duration-500"
        style={{ background: 'radial-gradient(420px circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.16), transparent 60%)' }}
      />
    </div>
  )
}
