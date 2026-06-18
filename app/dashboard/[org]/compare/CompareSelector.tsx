'use client'
import { useRouter } from 'next/navigation'
import { font, colors } from '@/lib/design'
import { fmtDate } from '@/lib/analytics'

interface Campaign { id: string; name: string; date: string }

interface Props {
  campaigns: Campaign[]
  orgSlug: string
  selectedA?: string
  selectedB?: string
}

export default function CompareSelector({ campaigns, orgSlug, selectedA, selectedB }: Props) {
  const router = useRouter()

  const update = (key: 'a' | 'b', value: string) => {
    const params = new URLSearchParams()
    if (key === 'a') {
      if (value) params.set('a', value)
      if (selectedB) params.set('b', selectedB)
    } else {
      if (selectedA) params.set('a', selectedA)
      if (value) params.set('b', value)
    }
    router.push(`/dashboard/${orgSlug}/compare?${params.toString()}`)
  }

  const selectStyle: React.CSSProperties = {
    padding: '10px 14px', borderRadius: 10,
    border: `1.5px solid ${colors.borderMid}`, background: '#fafaf9',
    fontSize: 13, fontFamily: font, color: colors.ink, outline: 'none',
    width: '100%', cursor: 'pointer',
  }

  if (campaigns.length < 2) return (
    <p style={{ fontFamily: font, fontSize: 13, color: colors.faint }}>
      Servono almeno 2 campagne per il confronto.
    </p>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', maxWidth: 700 }}>
      <div>
        <label style={{ fontFamily: font, fontSize: 11, color: colors.faint, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Più recente (A)</label>
        <select value={selectedA ?? ''} onChange={e => update('a', e.target.value)} style={selectStyle}>
          <option value="">Seleziona campagna…</option>
          {campaigns.filter(c => c.id !== selectedB).map(c => (
            <option key={c.id} value={c.id}>{c.name} — {fmtDate(c.date)}</option>
          ))}
        </select>
      </div>
      <div style={{ fontFamily: font, fontSize: 18, color: colors.faint, marginTop: 20 }}>vs</div>
      <div>
        <label style={{ fontFamily: font, fontSize: 11, color: colors.faint, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Precedente (B)</label>
        <select value={selectedB ?? ''} onChange={e => update('b', e.target.value)} style={selectStyle}>
          <option value="">Seleziona campagna…</option>
          {campaigns.filter(c => c.id !== selectedA).map(c => (
            <option key={c.id} value={c.id}>{c.name} — {fmtDate(c.date)}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
