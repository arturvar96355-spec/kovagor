/** Тонкие линейные иллюстрации услуг. Контуры помечены data-draw (прорисовываются GSAP), бегущие точки — data-dot. */
const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export function ServiceArt({ id }: { id: 'site' | 'motion' | 'integrations' | 'growth' }) {
  return (
    <svg viewBox="0 0 160 120" className="h-auto w-full" aria-hidden {...common}>
      {id === 'site' && (
        <>
          <rect data-draw x="10" y="14" width="140" height="92" rx="8" />
          <path data-draw d="M10 34h140" />
          <circle data-draw cx="24" cy="24" r="2.5" />
          <circle data-draw cx="34" cy="24" r="2.5" />
          <path data-draw d="M26 52h56M26 64h88M26 76h72" />
          <rect data-draw x="104" y="82" width="34" height="14" rx="7" />
        </>
      )}
      {id === 'motion' && (
        <>
          <path data-draw d="M14 104V16M14 104h136" />
          <path data-draw data-curve d="M14 104C54 104 56 20 148 20" />
          <circle data-dot r="4" fill="currentColor" stroke="none" />
        </>
      )}
      {id === 'integrations' && (
        <>
          <circle data-draw cx="30" cy="60" r="12" />
          <circle data-draw cx="130" cy="24" r="12" />
          <circle data-draw cx="130" cy="96" r="12" />
          <path data-draw data-curve d="M42 60C80 60 90 24 118 24" />
          <path data-draw d="M42 60C80 60 90 96 118 96" />
          <circle data-dot r="3.5" fill="currentColor" stroke="none" />
        </>
      )}
      {id === 'growth' && (
        <>
          <path data-draw d="M14 106h136" />
          <rect data-bar x="26" y="76" width="18" height="30" />
          <rect data-bar x="58" y="58" width="18" height="48" />
          <rect data-bar x="90" y="40" width="18" height="66" />
          <rect data-bar x="122" y="18" width="18" height="88" />
        </>
      )}
    </svg>
  )
}
