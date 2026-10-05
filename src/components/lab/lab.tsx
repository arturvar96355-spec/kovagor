'use client'

import { useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText, registerGsap, NO_REDUCED_MOTION } from '@/lib/animation'
import { SplitReveal } from '@/components/motion/split-reveal'
import { Magnetic } from '@/components/motion/magnetic'
import { TiltCard } from '@/components/motion/tilt-card'
import { Marquee } from '@/components/motion/marquee'
import { useSpotlight } from '@/components/motion/use-spotlight'

function Demo({ n, title, how, children, className = '' }: { n: string; title: string; how: string; children: ReactNode; className?: string }) {
  return (
    <article className={`flex min-w-0 flex-col rounded-3xl border border-line bg-paper-2 p-6 md:p-8 ${className}`}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
        <span className="font-display text-xl text-mute">{n}</span>
      </div>
      <div className="my-6 grid min-h-[200px] flex-1 place-items-center overflow-hidden rounded-2xl bg-paper">{children}</div>
      <p className="text-sm leading-relaxed text-mute">
        <span className="text-ink">Как сделано: </span>
        {how}
      </p>
    </article>
  )
}

/** 01: строки выезжают из-под маски (SplitText) — по кнопке проигрывается заново. */
function LinesDemo() {
  const [k, setK] = useState(0)
  return (
    <div className="p-6 text-center">
      <SplitReveal key={k} immediate className="font-display text-4xl leading-tight md:text-5xl">
        Движение, которое объясняет, а не отвлекает
      </SplitReveal>
      <button onClick={() => setK(k + 1)} className="mt-6 rounded-full border border-ink px-5 py-2 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-paper">
        Повторить
      </button>
    </div>
  )
}

/** 05: слова проявляются по мере прокрутки (scrub). */
function ScrubDemo() {
  const root = useRef<HTMLParagraphElement>(null)
  useGSAP(
    () => {
      registerGsap()
      const mm = gsap.matchMedia()
      mm.add(NO_REDUCED_MOTION, () => {
        let split: SplitText | undefined
        document.fonts.ready.then(() => {
          if (!root.current) return
          split = new SplitText(root.current, { type: 'words', autoSplit: true, aria: 'none' })
          gsap.set(split.words, { opacity: 0.18 })
          gsap.to(split.words, { opacity: 1, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'bottom 45%', scrub: true } })
        })
        return () => split?.revert()
      })
    },
    { scope: root },
  )
  return (
    <p ref={root} className="p-8 font-display text-3xl leading-snug md:text-4xl">
      Листайте страницу — слова загораются по одному, в такт прокрутке.
    </p>
  )
}

/** 06: прожектор у курсора. */
function SpotDemo() {
  const root = useRef<HTMLDivElement>(null)
  useSpotlight(root)
  return (
    <div ref={root} className="spot relative grid h-full w-full min-h-[200px] place-items-center bg-ink p-8 text-paper">
      <div className="relative">
        <div className="spot-base font-display text-4xl md:text-5xl">Ведите курсор</div>
        <div aria-hidden className="spot-top absolute inset-0 font-display text-4xl md:text-5xl">Ведите курсор</div>
      </div>
    </div>
  )
}

/** 07: контур рисуется (stroke-dashoffset), по наведению — заново. */
function DrawDemo() {
  const root = useRef<SVGSVGElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  useGSAP(
    () => {
      registerGsap()
      const mm = gsap.matchMedia()
      mm.add(NO_REDUCED_MOTION, () => {
        const paths = gsap.utils.toArray<SVGGeometryElement>('[data-d]', root.current)
        paths.forEach((p) => {
          const l = p.getTotalLength()
          gsap.set(p, { strokeDasharray: l, strokeDashoffset: l })
        })
        tl.current = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 85%', once: true } }).to(paths, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.15 })
      })
    },
    { scope: root },
  )
  return (
    <svg ref={root} viewBox="0 0 200 120" className="w-64 text-ink" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" onPointerEnter={() => tl.current?.restart()} aria-label="Рисующийся график">
      <path data-d d="M12 104V14M12 104h176" />
      <path data-d d="M12 94C48 94 52 34 96 40s54 40 92-26" />
      <circle data-d cx="188" cy="14" r="6" />
    </svg>
  )
}

/** 08: счётчик. */
function CountDemo() {
  const el = useRef<HTMLSpanElement>(null)
  const run = () => {
    const o = { v: 0 }
    gsap.to(o, { v: 100, duration: 1.8, ease: 'power3.out', onUpdate: () => el.current && (el.current.textContent = String(Math.round(o.v))) })
  }
  return (
    <button onClick={run} className="p-6 text-center" aria-label="Запустить счётчик">
      <span ref={el} className="font-display text-8xl tabular-nums">100</span>
      <span className="mt-2 block text-xs uppercase tracking-[0.2em] text-mute">нажмите</span>
    </button>
  )
}

/** 09: пружинная карточка (Motion drag). */
function DragDemo() {
  const area = useRef<HTMLDivElement>(null)
  return (
    <div ref={area} className="grid h-full min-h-[200px] w-full place-items-center">
      <motion.div
        drag
        dragConstraints={area}
        dragElastic={0.25}
        dragTransition={{ bounceStiffness: 260, bounceDamping: 14 }}
        whileDrag={{ scale: 1.06, rotate: 3, cursor: 'grabbing' }}
        whileHover={{ scale: 1.03 }}
        className="grid h-28 w-44 cursor-grab place-items-center rounded-2xl bg-ink font-display text-2xl text-paper"
      >
        Потяните
      </motion.div>
    </div>
  )
}

export function Lab() {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <Demo n="01" title="Строки из-под маски" how="GSAP SplitText (type: lines, mask) + expo.out, stagger 0.09. Сам заголовок остаётся читаемым для скринридеров и при «уменьшить движение»."><LinesDemo /></Demo>
        <Demo n="02" title="Магнитные кнопки" how="gsap.quickTo на x/y по pointermove (инерция 0.6 с). Включается только для мыши и без reduced-motion.">
          <div className="flex flex-wrap items-center justify-center gap-6 p-6">
            {['Один', 'Два', 'Три'].map((t, i) => (
              <Magnetic key={t} strength={0.3 + i * 0.1}>
                <span className="inline-block rounded-full bg-ink px-8 py-4 text-xs uppercase tracking-[0.2em] text-paper">{t}</span>
              </Magnetic>
            ))}
          </div>
        </Demo>
        <Demo n="03" title="Наклон и блик" how="3D-наклон через gsap.quickTo (rotationX/Y, perspective 900) и радиальный блик на CSS-переменных, следующий за курсором.">
          <TiltCard className="grid h-40 w-64 place-items-center rounded-2xl bg-ink font-display text-3xl text-paper">Наведите</TiltCard>
        </Demo>
        <Demo n="04" title="Бегущая строка" how="Скорость и наклон считаются из ScrollTrigger.getVelocity(): листайте быстрее — строка ускоряется и меняет направление.">
          <div className="w-full"><Marquee items={['Motion', 'GSAP', 'Lenis', 'WebGL']} /></div>
        </Demo>
        <Demo n="05" title="Слова по скроллу" how="SplitText (words) + scrub: непрозрачность слов привязана к положению страницы без собственной математики."><ScrubDemo /></Demo>
        <Demo n="06" title="Прожектор" how="Позиция курсора с инерцией пишется в CSS-переменные; два слоя текста и radial-gradient в mask-image. Без мыши текст просто читаем."><SpotDemo /></Demo>
        <Demo n="07" title="Рисующийся контур" how="stroke-dasharray / stroke-dashoffset по getTotalLength() и timeline со stagger. Наведите курсор, чтобы проиграть заново."><DrawDemo /></Demo>
        <Demo n="08" title="Счётчик" how="Анимируем число в обычном объекте и пишем в DOM в onUpdate; ease power3.out даёт мягкое замедление."><CountDemo /></Demo>
        <Demo n="09" title="Пружина" how="Motion: drag с упругим возвратом (bounceStiffness / bounceDamping), whileHover и whileDrag." className="md:col-span-2"><DragDemo /></Demo>
      </div>
    </>
  )
}
