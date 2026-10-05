'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ease, registerGsap, NO_REDUCED_MOTION } from '@/lib/animation'
import { projects } from '@/content/projects'

export function Work() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      registerGsap()
      const mm = gsap.matchMedia()
      mm.add(NO_REDUCED_MOTION, () => {
        gsap.utils.toArray<HTMLElement>('[data-work]').forEach((el) => {
          const media = el.querySelector('[data-media]')
          gsap.fromTo(el, { clipPath: 'inset(18% 12% 18% 12% round 24px)' }, {
            clipPath: 'inset(0% 0% 0% 0% round 24px)',
            ease: ease.inOut,
            scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 35%', scrub: true },
          })
          gsap.fromTo(media, { scale: 1.25 }, {
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          })
        })
      })
    },
    { scope: root },
  )
  return (
    <section ref={root} id="work" className="container-x border-t border-line py-[14vh]">
      <div className="mb-14 flex items-end justify-between">
        <p className="text-xs uppercase tracking-[0.35em] text-mute">Избранные работы</p>
        <span className="font-display text-xl text-mute">({String(projects.length).padStart(2, '0')})</span>
      </div>
      <div className="flex flex-col gap-[10vh]">
        {projects.map((p) => (
          <article key={p.slug} className="group">
            <div data-work className="relative aspect-[16/9] overflow-hidden rounded-3xl">
              <div data-media className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]" style={{ background: p.tone }} />
              <span className="absolute bottom-6 right-6 grid h-24 w-24 place-items-center rounded-full bg-paper text-xs uppercase tracking-[0.2em] opacity-0 transition-all duration-500 group-hover:opacity-100">
                Смотреть
              </span>
            </div>
            <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-4xl md:text-6xl">{p.title}</h3>
              <p className="text-sm uppercase tracking-[0.2em] text-mute">{p.kind} · {p.year}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
