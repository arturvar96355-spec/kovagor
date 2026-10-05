import { ImageResponse } from 'next/og'
import { MONOGRAM_PATHS, MONOGRAM_VIEWBOX } from '@/components/brand-paths'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f1ea' }}>
        <svg viewBox={MONOGRAM_VIEWBOX} width="120" height="91" fill="#1f1f1d">
          {MONOGRAM_PATHS.map((p) => (
            <path key={p.id} d={p.d} />
          ))}
        </svg>
      </div>
    ),
    size,
  )
}
