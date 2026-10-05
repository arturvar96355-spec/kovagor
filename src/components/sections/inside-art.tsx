/** Живые мини-иллюстрации карточек «Фишки»: чистый CSS (transform/opacity), без JS. */
export function InsideArt({ kind }: { kind: string }) {
  const box = 'relative h-28 w-full overflow-hidden rounded-2xl bg-paper'
  switch (kind) {
    case 'cube':
      return (
        <div aria-hidden className={`${box} grid place-items-center`}>
          <div className="art-float">
            <div className="art-spin grid h-16 w-16 place-items-center rounded-xl border-2 border-ink">
              <div className="art-spin-rev h-8 w-8 rounded-md bg-ink" />
            </div>
          </div>
        </div>
      )
    case 'scroll':
      return (
        <div aria-hidden className={box}>
          <div className="art-lines absolute inset-x-6 top-0 h-[200%] space-y-3 pt-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-2 rounded-full bg-ink/80" style={{ width: `${[90, 60, 75, 40, 85, 55][i % 6]}%`, opacity: i % 3 === 0 ? 1 : 0.35 }} />
            ))}
          </div>
          <div className="absolute inset-y-0 right-2 w-1 rounded-full bg-line"><div className="art-pulse h-6 w-1 rounded-full bg-ink" /></div>
        </div>
      )
    case 'send':
      return (
        <div aria-hidden className={`${box} flex items-center justify-between px-6`}>
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-ink font-display text-lg text-paper">Вы</div>
          <div className="relative mx-3 h-12 flex-1">
            {[0, 1].map((r) => (
              <div key={r} className="absolute inset-x-0 h-px bg-line" style={{ top: r ? '75%' : '25%' }}>
                <span className="art-fly absolute -top-1 left-0 block h-2.5 w-2.5 rounded-full bg-ink" style={{ animationDelay: `${r * 0.9}s`, ['--fly' as string]: '110px' }} />
              </div>
            ))}
          </div>
          <div className="space-y-1.5 text-[10px] uppercase tracking-widest">
            <div className="rounded-full border border-ink px-2 py-0.5">Telegram</div>
            <div className="rounded-full border border-ink px-2 py-0.5">Почта</div>
          </div>
        </div>
      )
    case 'toggle':
      return (
        <div aria-hidden className={`${box} grid place-items-center`}>
          <div className="relative h-10 w-[72px] rounded-full border-2 border-ink">
            <div className="art-knob absolute left-1 top-1 h-7 w-7 rounded-full bg-ink" />
          </div>
        </div>
      )
    case 'speed':
      return (
        <div aria-hidden className={`${box} flex flex-col justify-center gap-3 px-6`}>
          {[100, 70, 40].map((w, i) => (
            <div key={i} className="h-2 overflow-hidden rounded-full bg-line" style={{ width: `${w}%` }}>
              <div className="art-fill h-full w-full rounded-full bg-ink" style={{ animationDelay: `${i * 0.25}s` }} />
            </div>
          ))}
        </div>
      )
    default:
      return (
        <div aria-hidden className={box}>
          <div className="absolute inset-0 grid grid-cols-3 gap-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-line" />
            ))}
          </div>
          <div className="art-ring absolute left-[22px] top-[18px] h-[42px] w-[42px] rounded-xl border-2 border-ink" />
        </div>
      )
  }
}
