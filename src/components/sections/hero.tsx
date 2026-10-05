'use client'

import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger, ease, registerGsap, NO_REDUCED_MOTION } from '@/lib/animation'
import { PRELOAD_KEY } from '@/components/motion/preloader'
import { Monogram } from '@/components/brand'
import { SplitReveal } from '@/components/motion/split-reveal'
import { Magnetic } from '@/components/motion/magnetic'
import { Hero3D } from '@/components/three/hero-3d'
import { heroScene } from '@/components/three/state'

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const [ready3d, setReady3d] = useState(false)

  useGSAP(
    () => {
      registerGsap()
      let seen = true
      try { seen = sessionStorage.getItem(PRELOAD_KEY) === '1' } catch {}
      const d = seen ? 0 : 1.6 // ждём окончания заставки
      heroScene.startAt = performance.now() / 1000 + d
      const mm = gsap.matchMedia()
      mm.add(NO_REDUCED_MOTION, () => {
        // прогресс прокрутки → WebGL-сцена
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => (heroScene.progress = self.progress),
        })
        // монограмма: контуры проявляются по очереди
        gsap.from('[data-mono-path]', {
          opacity: 0,
          yPercent: 8,
          duration: 1.4,
          ease: ease.out,
          stagger: 0.12,
          delay: d,
        })
        gsap.from('[data-hero-fade]', { opacity: 0, y: 16, duration: 1, ease: ease.soft, delay: 0.9 + d, stagger: 0.12 })
        // лёгкий параллакс монограммы при скролле
        gsap.to('[data-mono-wrap]', {
          yPercent: 18,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="container-x relative flex min-h-svh flex-col justify-between overflow-hidden pb-10 pt-28">
      <div data-mono-wrap className={`pointer-events-none absolute right-[-4vw] top-1/2 w-[62vw] max-w-[900px] -translate-y-1/2 text-ink/[0.07] transition-opacity duration-700 ${ready3d ? 'opacity-0' : 'opacity-100'}`}>
        <Monogram />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[46vw]">
        <Hero3D onReady={() => setReady3d(true)} />
      </div>

      <div className="relative z-10 mt-[10vh] max-w-5xl lg:max-w-[58vw]">
        <p data-hero-fade className="mb-8 text-xs uppercase tracking-[0.35em] text-mute">Студия сайтов под ключ</p>
        <SplitReveal as="h1" delay={(() => { try { return sessionStorage.getItem(PRELOAD_KEY) === "1" ? 0 : 1.6 } catch { return 0 } })()} className="font-display text-[clamp(3rem,7.6vw,8.5rem)] font-medium leading-[0.95] tracking-tight">
          Сайты, которые продают ещё до первого звонка
        </SplitReveal>
      </div>

      <div className="relative z-10 flex flex-wrap items-end justify-between gap-8">
        <p data-hero-fade className="max-w-md text-lg leading-relaxed text-ink-2">
          Дизайн, анимации и разработка в одной команде. От идеи до запуска — без посредников.
        </p>
        <div data-hero-fade>
          <Magnetic>
            <a href="#contact" className="inline-flex items-center gap-3 rounded-full bg-ink px-9 py-5 text-sm uppercase tracking-[0.2em] text-paper transition-colors hover:bg-ink-2">
              Обсудить проект <span aria-hidden>→</span>
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  )
}
