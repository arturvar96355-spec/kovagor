'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, registerGsap, NO_REDUCED_MOTION } from '@/lib/animation'
import { process } from '@/content/process'
import { SectionHead } from '@/components/motion/section-head'
import { ProcessArt } from './process-art'

export function Process() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      registerGsap()
      const mm = gsap.matchMedia()
      mm.add(NO_REDUCED_MOTION, () => {
        // линия маршрута «рисуется» по мере прокрутки
        gsap.fromTo('[data-line]', { scaleY: 0 }, {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top',
          scrollTrigger: { trigger: '[data-steps]', start: 'top 60%', end: 'bottom 60%', scrub: true },
        })
        gsap.utils.toArray<HTMLElement>('[data-step]').forEach((s) => {
          gsap.from(s, { opacity: 0.2, x: 30, scrollTrigger: { trigger: s, start: 'top 75%', end: 'top 50%', scrub: true } })
          // узел на линии «загорается», когда шаг достигнут
          gsap.fromTo(s.querySelector('[data-node]'), { scale: 0.4, backgroundColor: 'rgba(0,0,0,0)' }, {
            scale: 1,
            backgroundColor: 'var(--color-ink)',
            ease: 'back.out(2)',
            duration: 0.5,
            scrollTrigger: { trigger: s, start: 'top 60%', toggleActions: 'play none none reverse' },
          })
        })
      })
      // иллюстрации (скрыты ниже lg; getTotalLength у скрытых SVG бросает исключение — отдельное условие)
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('[data-step]').forEach((step) => {
          const art = step.querySelector<SVGSVGElement>('[data-art] svg')
          if (!art) return
          const draws = Array.from(art.querySelectorAll<SVGGeometryElement>('[data-draw]'))
          const pulses = Array.from(art.querySelectorAll<SVGGeometryElement>('[data-pulse]'))
          draws.forEach((el) => {
            const len = el.getTotalLength()
            gsap.set(el, { strokeDasharray: len, strokeDashoffset: len })
          })
          const tl = gsap.timeline({ scrollTrigger: { trigger: step, start: 'top 65%', once: true } })
          if (draws.length) tl.to(draws, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut', stagger: 0.1 })
          if (pulses.length) tl.to(pulses, { opacity: 0.15, duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.2 }, 1)
        })
      })
    },
    { scope: root },
  )
  return (
    <section ref={root} id="process" className="overflow-x-clip container-x border-t border-line py-[14vh]">
      <SectionHead index="02" label="Процесс" title="Как мы работаем" />
      <div data-steps className="relative pl-10 md:pl-24">
        <div className="absolute bottom-0 left-2 top-0 w-px bg-line md:left-8">
          <div data-line className="h-full w-px bg-ink" />
        </div>
        {process.map((s) => (
          <div key={s.n} data-step className="relative grid items-center gap-8 py-14 lg:grid-cols-[1fr_220px]">
            <span data-node aria-hidden className="absolute -left-[37px] top-[72px] h-3 w-3 rounded-full border border-ink md:-left-[93px]" />
            <div>
              <span className="font-display text-xl text-mute">{s.n}</span>
              <h3 className="font-display text-5xl md:text-7xl">{s.title}</h3>
              <p className="mt-4 max-w-xl text-lg text-ink-2">{s.text}</p>
              <p className="mt-5 text-sm uppercase tracking-[0.18em] text-mute">
                <span className="text-ink">Вы получаете: </span>
                {s.get}
              </p>
            </div>
            <div data-art className="hidden text-ink lg:block">
              <ProcessArt id={s.art} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
