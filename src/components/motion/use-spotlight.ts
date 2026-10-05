'use client'

import { useGSAP } from '@gsap/react'
import type { RefObject } from 'react'
import { gsap, registerGsap } from '@/lib/animation'

/**
 * «Прожектор»: позиция курсора (с инерцией) пишется в CSS-переменные --mx/--my и ставится data-spot="on".
 * Переменные выставляются на корне и на каждом [data-spot-item] в его собственных координатах
 * (маска у каждого блока считается от его левого верхнего угла). Только мышь и без reduced-motion.
 * Стили эффекта — в globals.css (.spot).
 */
export function useSpotlight(ref: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      registerGsap()
      const el = ref.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        el.dataset.spot = 'on'
        const items = Array.from(el.querySelectorAll<HTMLElement>('[data-spot-item]'))
        const pos = { x: -9999, y: -9999 } // координаты в окне
        const set = (t: HTMLElement) => {
          const r = t.getBoundingClientRect()
          t.style.setProperty('--mx', `${pos.x - r.left}px`)
          t.style.setProperty('--my', `${pos.y - r.top}px`)
        }
        const apply = () => {
          set(el)
          items.forEach(set)
        }
        const tx = gsap.quickTo(pos, 'x', { duration: 0.6, ease: 'power3.out', onUpdate: apply })
        const ty = gsap.quickTo(pos, 'y', { duration: 0.6, ease: 'power3.out', onUpdate: apply })
        const move = (e: PointerEvent) => {
          tx(e.clientX)
          ty(e.clientY)
        }
        el.addEventListener('pointermove', move)
        return () => {
          el.removeEventListener('pointermove', move)
          delete el.dataset.spot
        }
      })
    },
    { scope: ref },
  )
}
