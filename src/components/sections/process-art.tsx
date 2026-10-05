import type { ProcessArtId } from '@/content/process'

const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/** Линейные иллюстрации шагов процесса: контуры (data-draw) прорисовываются GSAP, data-pulse — циклическая пульсация. */
export function ProcessArt({ id }: { id: ProcessArtId }) {
  return (
    <svg viewBox="0 0 160 120" className="h-auto w-full" aria-hidden {...common}>
      {id === 'brief' && (
        <>
          <rect data-draw x="32" y="12" width="96" height="96" rx="8" />
          <path data-draw d="M48 36h48M48 52h64M48 68h40" />
          <path data-draw d="M48 90l8 8 16-18" />
        </>
      )}
      {id === 'design' && (
        <>
          <rect data-draw x="14" y="14" width="132" height="92" rx="8" />
          <path data-draw d="M14 40h132M64 40v66" />
          <rect data-draw x="76" y="52" width="58" height="22" rx="4" />
          <path data-draw d="M76 88h58M76 98h34" />
          <path data-draw d="M24 56h30M24 70h30M24 84h20" />
        </>
      )}
      {id === 'build' && (
        <>
          <path data-draw d="M52 36L24 60l28 24" />
          <path data-draw d="M108 36l28 24-28 24" />
          <path data-draw d="M90 26L70 94" />
          <path data-pulse d="M146 106h-10" strokeWidth="3" />
        </>
      )}
      {id === 'launch' && (
        <>
          <path data-draw d="M14 106h132" />
          <path data-draw d="M30 106c20 0 24-30 50-52s46-30 54-34" />
          <path data-draw d="M120 20h14v14" />
          <circle data-pulse cx="134" cy="20" r="8" />
        </>
      )}
    </svg>
  )
}
