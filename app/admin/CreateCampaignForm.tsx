'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { font, colors } from '@/lib/design'

interface Props { orgs: { id: string; name: string }[] }

export default function CreateCampaignForm({ orgs }: Props) {
  const [orgId, setOrgId] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ access_code: string; name: string } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setResult(null)
    const res = await fetch('/api/admin/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, name }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Errore'); setLoading(false); return }
    setResult(data)
    setName(''); setOrgId('')
    setLoading(false)
    router.refresh()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13,
    border: `1.5px solid ${colors.borderMid}`, background: '#fafaf9',
    fontFamily: font, color: colors.ink, outline: 'none', boxSizing: 'border-box',
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <label style={{ fontSize: 10, color: colors.faint, fontFamily: font, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Organizzazione</label>
        <select value={orgId} onChange={e => setOrgId(e.target.value)} required style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="">Seleziona…</option>
          {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>
      <div>
        <label style={{ fontSize: 10, color: colors.faint, fontFamily: font, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Nome campagna</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Q1 2025 · Happiness Survey" required style={inputStyle} />
      </div>
      {error && <p style={{ fontSize: 11, color: '#dc2626', fontFamily: font, margin: 0 }}>{error}</p>}
      {result && (
        <div style={{ padding: '10px 12px', borderRadius: 8, background: '#ecfdf5', border: '1px solid #bbf7d0' }}>
          <p style={{ fontFamily: font, fontSize: 11, color: '#059669', margin: 0, fontWeight: 700 }}>Campagna creata!</p>
          <p style={{ fontFamily: font, fontSize: 13, color: '#065f46', margin: '4px 0 0', letterSpacing: '0.1em', fontWeight: 700 }}>Codice: {result.access_code}</p>
        </div>
      )}
      <button type="submit" disabled={loading} style={{
        padding: '10px 16px', borderRadius: 8, border: 'none',
        background: loading ? colors.borderMid : colors.ink,
        color: loading ? colors.faint : colors.wheat,
        fontSize: 13, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: font,
      }}>{loading ? 'Creazione…' : 'Crea campagna'}</button>
    </form>
  )
}
