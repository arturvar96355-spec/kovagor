import { MONOGRAM_PATHS, MONOGRAM_VIEWBOX } from './brand-paths'

/** Монограмма KVG инлайн-SVG: наследует цвет текста, контуры доступны для анимации (data-mono-path). */
export function Monogram({ className, title = 'KOVAGOR' }: { className?: string; title?: string }) {
  return (
    <svg viewBox={MONOGRAM_VIEWBOX} className={className} role="img" aria-label={title} fill="currentColor">
      {MONOGRAM_PATHS.map((p) => (
        <path key={p.id} d={p.d} data-mono-path />
      ))}
    </svg>
  )
}
