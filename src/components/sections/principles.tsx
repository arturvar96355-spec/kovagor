'use client'

import { useRef } from 'react'
import { useSpotlight } from '@/components/motion/use-spotlight'
import { principles } from '@/content/principles'
import { SectionHead } from '@/components/motion/section-head'

/**
 * Тёмная секция с «прожектором»: рядом с курсором текст проявляется, вдали — приглушён.
 * Два слоя одного текста: нижний приглушён, верхний показывается через маску-круг, следующую за курсором (с инерцией).
 * На устройствах без мыши и при reduced-motion — просто полностью читаемый текст.
 */
export function Principles() {
  const root = useRef<HTMLElement>(null)

  useSpotlight(root)

  return (
    <section ref={root} id="principles" className="spot relative overflow-hidden bg-ink px-[clamp(20px,4vw,64px)] py-[16vh] text-paper">
      <div className="mx-auto max-w-7xl">
        <SectionHead index="02" label="Принципы" title="Как мы думаем" dark />
        <div className="grid gap-x-16 gap-y-20 md:grid-cols-2">
          {principles.map((p) => (
            <div key={p.n} data-spot-item className="relative">
              {/* нижний слой — приглушённый */}
              <div className="spot-base">
                <PrincipleBody n={p.n} title={p.title} text={p.text} />
              </div>
              {/* верхний слой — яркий, виден в круге у курсора */}
              <div aria-hidden className="spot-top absolute inset-0">
                <PrincipleBody n={p.n} title={p.title} text={p.text} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PrincipleBody({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <>
      <span className="font-display text-xl">{n}</span>
      <h3 className="mt-2 font-display text-5xl leading-tight md:text-6xl">{title}</h3>
      <p className="mt-4 max-w-md text-lg leading-relaxed">{text}</p>
    </>
  )
}
