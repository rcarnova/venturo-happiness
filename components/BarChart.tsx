'use client'
import { getLevel } from '@/lib/analytics'
import { font } from '@/lib/design'

export { getLevel }

interface DataPoint { dim: string; value: number }

export default function BarChart({ data, height = 180 }: { data: DataPoint[]; height?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 6, height, padding: '0 4px' }}>
      {data.map((d, i) => {
        const h = (d.value / 5) * (height - 36)
        const lv = getLevel(d.value)
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#1a1a2e', fontFamily: font }}>{d.value.toFixed(1)}</span>
            <div title={`${d.dim}: ${d.value.toFixed(2)}`} style={{
              width: 28, height: Math.max(3, h), borderRadius: '5px 5px 2px 2px',
              background: `linear-gradient(180deg, ${lv.color}cc, ${lv.color}66)`,
              transition: 'height 0.4s ease',
            }} />
            <span style={{
              fontSize: 8, color: '#a8a29e', fontFamily: font,
              writingMode: 'vertical-rl', transform: 'rotate(180deg)',
              maxHeight: 54, overflow: 'hidden',
            }}>{d.dim}</span>
          </div>
        )
      })}
    </div>
  )
}
