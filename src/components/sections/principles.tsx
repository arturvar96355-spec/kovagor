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
        <SectionHead index="02" label="Принципы" title="Как мы делаем сайты" dark />
        <div className="grid gap-x-16 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
          {principles.map((p) => (
            <div key={p.n} data-spot-item className="relative">
              {/* нижний слой — приглушённый */}
              <div className="spot-base">
                <PrincipleBody p={p} />
              </div>
              {/* верхний слой — яркий, виден в круге у курсора */}
              <div aria-hidden className="spot-top absolute inset-0">
                <PrincipleBody p={p} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PrincipleBody({ p }: { p: (typeof principles)[number] }) {
  return (
    <>
      <span className="font-display text-xl">{p.n}</span>
      <h3 className="mt-2 font-display text-4xl leading-tight md:text-5xl">{p.title}</h3>
      <p className="mt-4 max-w-md text-base leading-relaxed">{p.how}</p>
      <p className="mt-4 max-w-md border-t border-current/25 pt-4 text-base leading-relaxed">
        <span className="mb-1 block text-xs uppercase tracking-[0.25em]">Что это даёт</span>
        {p.gain}
      </p>
    </>
  )
}
