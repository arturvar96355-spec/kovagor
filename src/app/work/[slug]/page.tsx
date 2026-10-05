import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProject, projects } from '@/content/projects'
import { Header } from '@/components/layout-header'
import { Footer } from '@/components/footer'
import { SplitReveal } from '@/components/motion/split-reveal'
import { Reveal } from '@/components/motion/reveal'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProject((await params).slug)
  return p ? { title: `${p.title} — кейс KOVAGOR`, description: p.task } : {}
}

export default async function CasePage({ params }: Props) {
  const p = getProject((await params).slug)
  if (!p) notFound()
  const i = projects.findIndex((x) => x.slug === p.slug)
  const next = projects[(i + 1) % projects.length]

  return (
    <>
      <Header />
      <main className="pt-36">
        <section className="container-x">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-mute">{p.kind} · {p.year}</p>
          <SplitReveal as="h1" className="font-display text-[clamp(3rem,10vw,10rem)] leading-[0.95]">{p.title}</SplitReveal>
        </section>

        <div className="container-x mt-16">
          <div className="aspect-[16/8] rounded-3xl" style={{ background: p.tone }} />
        </div>

        <Reveal className="container-x grid gap-16 py-[14vh] lg:grid-cols-2">
          <div data-stagger>
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-mute">Задача</p>
            <p className="font-display text-3xl leading-snug md:text-4xl">{p.task}</p>
          </div>
          <div data-stagger>
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-mute">Решение</p>
            <p className="text-lg leading-relaxed text-ink-2">{p.solution}</p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <li key={s} className="rounded-full border border-line px-4 py-2 text-sm">{s}</li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal className="container-x grid gap-px border-y border-line py-[10vh] md:grid-cols-3">
          {p.results.map((r) => (
            <div key={r.label} data-stagger className="py-6">
              <p className="font-display text-7xl">{r.value}</p>
              <p className="mt-2 text-sm uppercase tracking-[0.2em] text-mute">{r.label}</p>
            </div>
          ))}
        </Reveal>

        <Link href={`/work/${next.slug}`} className="container-x group block py-[14vh]">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-mute">Следующий кейс</p>
          <p className="font-display text-6xl transition-transform duration-500 group-hover:translate-x-4 md:text-8xl">{next.title} →</p>
        </Link>
      </main>
      <Footer />
    </>
  )
}
