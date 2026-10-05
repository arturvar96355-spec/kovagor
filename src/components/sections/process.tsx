'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, registerGsap, NO_REDUCED_MOTION } from '@/lib/animation'
import { process } from '@/content/process'

export function Process() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      registerGsap()
      const mm = gsap.matchMedia()
      mm.add(NO_REDUCED_MOTION, () => {
        gsap.fromTo('[data-line]', { scaleY: 0 }, {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top',
          scrollTrigger: { trigger: '[data-steps]', start: 'top 60%', end: 'bottom 60%', scrub: true },
        })
        gsap.utils.toArray<HTMLElement>('[data-step]').forEach((s) =>
          gsap.from(s, { opacity: 0.2, x: 30, scrollTrigger: { trigger: s, start: 'top 75%', end: 'top 50%', scrub: true } }),
        )
      })
    },
    { scope: root },
  )
  return (
    <section ref={root} id="process" className="overflow-x-clip container-x border-t border-line py-[14vh]">
      <p className="mb-14 text-xs uppercase tracking-[0.35em] text-mute">Как мы работаем</p>
      <div data-steps className="relative pl-10 md:pl-24">
        <div className="absolute bottom-0 left-2 top-0 w-px bg-line md:left-8">
          <div data-line className="h-full w-px bg-ink" />
        </div>
        {process.map((s) => (
          <div key={s.n} data-step className="py-14">
            <span className="font-display text-xl text-mute">{s.n}</span>
            <h3 className="font-display text-5xl md:text-7xl">{s.title}</h3>
            <p className="mt-4 max-w-xl text-lg text-ink-2">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
