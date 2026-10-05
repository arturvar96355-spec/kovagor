'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger, registerGsap, NO_REDUCED_MOTION } from '@/lib/animation'

/** Бегущая строка: скорость и наклон реагируют на скорость скролла, направление — на его сторону. */
export function Marquee({ items }: { items: readonly string[] }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      registerGsap()
      const mm = gsap.matchMedia()
      mm.add(NO_REDUCED_MOTION, () => {
        const track = root.current!.querySelector<HTMLElement>('[data-track]')!
        const row = track.scrollWidth / 4 // период = ширина одного ряда → бесшовная петля
        const wrap = gsap.utils.wrap(-row, 0)
        let x = 0
        let dir = 1
        let boost = 0
        const skew = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3.out' })
        const tick = (_t: number, dt: number) => {
          boost *= 0.92
          x -= (60 + Math.abs(boost)) * dir * (dt / 1000)
          gsap.set(track, { x: wrap(x) })
        }
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const vel = self.getVelocity()
            if (vel !== 0) dir = Math.sign(vel) // вниз по странице → строка идёт влево, вверх → вправо
            boost = Math.min(Math.abs(vel) / 6, 600)
            skew(gsap.utils.clamp(-8, 8, -vel / 300))
          },
        })
        gsap.ticker.add(tick)
        return () => {
          gsap.ticker.remove(tick)
          st.kill()
        }
      })
    },
    { scope: root },
  )

  const cells = items.map((t) => (
    <span key={t} className="flex items-center gap-[4vw] pr-[4vw]">
      <span>{t}</span>
      <span aria-hidden className="text-mute">✦</span>
    </span>
  ))

  return (
    <div ref={root} aria-hidden className="overflow-hidden border-t border-line py-8">
      <div data-track className="flex w-max whitespace-nowrap font-display text-[clamp(3rem,9vw,9rem)] leading-none will-change-transform">
        {cells}
        {cells}
        {cells}
        {cells}
      </div>
    </div>
  )
}
