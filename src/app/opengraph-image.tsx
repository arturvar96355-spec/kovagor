import { ImageResponse } from 'next/og'
import { MONOGRAM_PATHS, MONOGRAM_VIEWBOX } from '@/components/brand-paths'

export const alt = 'KOVAGOR — web studio'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Только латиница: встроенный шрифт ImageResponse не содержит кириллицы.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', background: '#f4f1ea', color: '#1f1f1d', padding: '0 110px' }}>
        <svg viewBox={MONOGRAM_VIEWBOX} width="420" height="318" fill="#1f1f1d">
          {MONOGRAM_PATHS.map((p) => (
            <path key={p.id} d={p.d} />
          ))}
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 90 }}>
          <div style={{ fontSize: 84, letterSpacing: 18, fontWeight: 600 }}>KOVAGOR</div>
          <div style={{ marginTop: 22, fontSize: 30, letterSpacing: 8, color: '#7a7770' }}>WEB STUDIO · TURNKEY</div>
        </div>
      </div>
    ),
    size,
  )
}
