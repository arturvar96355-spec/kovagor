'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import { gsap, registerGsap } from '@/lib/animation'
import type { Project } from '@/content/projects'

/** Список проектов; при наведении рядом с курсором появляется превью-карточка (с инерцией). Только мышь и без reduced-motion. */
export function ProjectRows({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLParagraphElement>(null)
  const kind = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      registerGsap()
      const el = root.current
      const c = card.current
      if (!el || !c) return
      const mm = gsap.matchMedia()
      mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        gsap.set(c, { xPercent: -50, yPercent: -50, clipPath: 'inset(50% 50% 50% 50% round 20px)' })
        const x = gsap.quickTo(c, 'x', { duration: 0.6, ease: 'power3.out' })
        const y = gsap.quickTo(c, 'y', { duration: 0.6, ease: 'power3.out' })
        const rot = gsap.quickTo(c, 'rotation', { duration: 0.6, ease: 'power3.out' })
        let last = 0
        const move = (e: PointerEvent) => {
          x(e.clientX + 24)
          y(e.clientY - 12)
          rot(gsap.utils.clamp(-8, 8, (e.clientX - last) * 0.3))
          last = e.clientX
        }
        const enter = (e: Event) => {
          const row = e.currentTarget as HTMLElement
          c.style.background = row.dataset.tone ?? '#1f1f1d'
          if (title.current) title.current.textContent = row.dataset.title ?? ''
          if (kind.current) kind.current.textContent = row.dataset.kind ?? ''
          gsap.to(c, { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 0.6, ease: 'expo.out', overwrite: 'auto' })
        }
        const leave = () => gsap.to(c, { clipPath: 'inset(50% 50% 50% 50% round 20px)', duration: 0.45, ease: 'power3.inOut', overwrite: 'auto' })
        const rows = Array.from(el.querySelectorAll<HTMLElement>('[data-row]'))
        rows.forEach((r) => {
          r.addEventListener('pointerenter', enter)
          r.addEventListener('pointerleave', leave)
        })
        el.addEventListener('pointermove', move)
        return () => {
          rows.forEach((r) => {
            r.removeEventListener('pointerenter', enter)
            r.removeEventListener('pointerleave', leave)
          })
          el.removeEventListener('pointermove', move)
        }
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="mx-auto max-w-5xl">
      {projects.map((p) => (
        <Link
          key={p.slug}
          href={`/work/${p.slug}`}
          data-row
          data-tone={p.tone}
          data-title={p.title}
          data-kind={p.kind}
          data-goal="case_open"
          data-goal-param={p.slug}
          className="group flex items-baseline justify-between gap-6 border-b border-line py-7 first:border-t"
        >
          <span className="font-display text-3xl transition-transform duration-500 group-hover:translate-x-3 md:text-5xl">{p.title}</span>
          <span className="flex items-center gap-4 text-sm uppercase tracking-[0.2em] text-mute">
            <span className="hidden sm:inline">{p.kind}</span>
            <span aria-hidden className="transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1">↗</span>
          </span>
        </Link>
      ))}
      {/* превью-карточка за курсором (только мышь) */}
      <div ref={card} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[60] hidden h-[170px] w-[260px] flex-col justify-end rounded-[20px] p-5 text-paper [@media(pointer:fine)]:flex" style={{ clipPath: 'inset(50% 50% 50% 50% round 20px)' }}>
        <p ref={title} className="font-display text-3xl leading-none" />
        <p ref={kind} className="mt-2 text-[11px] uppercase tracking-[0.2em] opacity-70" />
      </div>
    </div>
  )
}
