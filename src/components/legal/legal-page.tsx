import type { ReactNode } from 'react'
import { Header } from '@/components/layout-header'
import { Footer } from '@/components/footer'

/** Каркас юр. страницы. Реквизиты оператора подставить до публикации (TODO(legal)). */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="container-x mx-auto max-w-4xl pb-[14vh] pt-40">
        <h1 className="font-display text-5xl md:text-7xl">{title}</h1>
        <p className="mt-4 text-sm text-mute">Редакция от {updated}</p>
        <div className="mt-12 space-y-5 text-[17px] leading-relaxed text-ink-2 [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:text-ink [&_ul]:list-disc [&_ul]:pl-6">
          {children}
        </div>
      </main>
      <Footer />
    </>
  )
}

export const OPERATOR = 'TODO(legal): наименование, ИНН/ОГРН(ИП), адрес, email оператора'
