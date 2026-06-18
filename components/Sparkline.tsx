'use client'

export default function Sparkline({ points, width = 170, height = 44 }: { points: number[]; width?: number; height?: number }) {
  if (points.length < 2) return null
  const mn = Math.min(...points) - 0.3
  const mx = Math.max(...points) + 0.3
  const r = mx - mn || 1
  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * width,
    y: height - ((p - mn) / r) * height,
  }))
  const d = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <path d={d} fill="none" stroke="#1a1a2e" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={2.5} fill={i === coords.length - 1 ? '#d4a037' : '#1a1a2e'} stroke="#fff" strokeWidth={1.2} />
      ))}
    </svg>
  )
}
