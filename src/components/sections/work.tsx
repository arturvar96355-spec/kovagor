import Link from 'next/link'
import { projects } from '@/content/projects'
import { SectionHead } from '@/components/motion/section-head'
import { Reveal } from '@/components/motion/reveal'

/** Портфолио — спокойный список без крупных кадров: подтверждает опыт, не перетягивает внимание с услуг и тарифов. */
export function Work() {
  return (
    <section id="work" className="container-x border-t border-line py-[14vh]">
      <SectionHead index="04" label="Проекты" title="Примеры работ" />
      <Reveal className="mx-auto max-w-5xl">
        {projects.map((p) => (
          <Link key={p.slug} href={`/work/${p.slug}`} data-goal="case_open" data-goal-param={p.slug} data-stagger className="group flex items-baseline justify-between gap-6 border-b border-line py-7 first:border-t">
            <span className="font-display text-3xl transition-transform duration-500 group-hover:translate-x-3 md:text-5xl">{p.title}</span>
            <span className="flex items-center gap-4 text-sm uppercase tracking-[0.2em] text-mute">
              <span className="hidden sm:inline">{p.kind}</span>
              <span aria-hidden className="transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1">↗</span>
            </span>
          </Link>
        ))}
      </Reveal>
    </section>
  )
}
