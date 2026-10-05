'use client'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container-x grid min-h-svh place-content-center gap-6">
      <h1 className="font-display text-5xl">Что-то пошло не так</h1>
      <p className="max-w-md text-lg text-ink-2">Страница не загрузилась. Попробуйте ещё раз, а если не получится — напишите нам.</p>
      <div>
        <button onClick={reset} className="rounded-full bg-ink px-8 py-4 text-xs uppercase tracking-[0.2em] text-paper">Повторить</button>
      </div>
    </main>
  )
}
