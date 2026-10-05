'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, registerGsap } from '@/lib/animation'
import { inside } from '@/content/inside'
import { InsideArt } from './inside-art'
import { SectionHead } from '@/components/motion/section-head'

/**
 * «Внутри этого сайта»: секция закрепляется, а карточки едут по горизонтали, пока вы листаете вниз.
 * Счётчик и линия прогресса привязаны к скроллу. На узких экранах и при reduced-motion — обычная сетка.
 */
export function Inside() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const counter = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      registerGsap()
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const t = track.current!
        const distance = () => Math.max(0, t.scrollWidth - window.innerWidth + window.innerWidth * 0.08)
        const cards = gsap.utils.toArray<HTMLElement>('[data-inside-card]')
        const tween = gsap.to(t, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance() + window.innerHeight * 0.4}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              gsap.set(bar.current, { scaleX: self.progress })
              const i = Math.min(cards.length, Math.max(1, Math.round(self.progress * (cards.length - 1)) + 1))
              if (counter.current) counter.current.textContent = String(i).padStart(2, '0')
            },
          },
        })
        // карточки чуть «подтягиваются» и светлеют при приближении к центру экрана
        cards.forEach((card) => {
          gsap.fromTo(card, { opacity: 0.35, scale: 0.94 }, {
            opacity: 1,
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 85%', end: 'left 45%', scrub: true },
          })
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="inside" className="relative overflow-hidden border-t border-line py-[10vh] min-[900px]:flex min-[900px]:min-h-svh min-[900px]:flex-col min-[900px]:justify-center min-[900px]:py-0">
      <div className="container-x min-[900px]:pt-24">
        <SectionHead index="04" label="Фишки" title="Фишки, которые можно забрать себе" />
        <p className="-mt-10 mb-12 max-w-xl text-lg text-ink-2 min-[900px]:mb-14">Этот сайт — наша визитка и полигон. Каждая фишка здесь работает по-настоящему, и каждую можно перенести на ваш проект.</p>
      </div>
      <div ref={track} className="container-x grid gap-5 min-[900px]:flex min-[900px]:w-max min-[900px]:gap-6 min-[900px]:pb-24">
        {inside.map((c) => (
          <article key={c.n} data-inside-card className="group flex flex-col justify-between gap-6 rounded-3xl border border-line bg-paper-2 p-6 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-2 hover:shadow-[0_24px_50px_-24px_rgba(31,31,29,.35)] min-[900px]:h-[56vh] min-[900px]:min-h-[430px] min-[900px]:w-[min(62vw,520px)] min-[900px]:p-8">
            <div>
              <div className="mb-5 flex items-center justify-between">
                <span className="font-display text-xl text-mute">{c.n}</span>
                <span className="rounded-full border border-ink/30 px-3 py-1 text-[11px] uppercase tracking-[0.2em]">{c.tag}</span>
              </div>
              <InsideArt kind={c.art} />
            </div>
            <div>
              <h3 className="font-display text-3xl leading-tight min-[900px]:text-4xl">{c.title}</h3>
              <p className="mt-3 max-w-md text-base leading-relaxed text-ink-2">{c.text}</p>
            </div>
          </article>
        ))}
      </div>
      <div aria-hidden className="container-x hidden items-center gap-5 min-[900px]:absolute min-[900px]:inset-x-0 min-[900px]:bottom-8 min-[900px]:flex">
        <span className="font-display text-xl tabular-nums"><span ref={counter}>01</span> / {String(inside.length).padStart(2, '0')}</span>
        <div className="h-px flex-1 bg-line">
          <div ref={bar} className="h-full origin-left scale-x-0 bg-ink" />
        </div>
      </div>
    </section>
  )
}
