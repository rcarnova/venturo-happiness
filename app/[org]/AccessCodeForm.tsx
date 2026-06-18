'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { font, colors } from '@/lib/design'

interface Props { orgSlug: string; orgId: string }

export default function AccessCodeForm({ orgSlug, orgId }: Props) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/survey/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, code: code.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok || !data.campaignId) {
        setError(data.error || 'Codice non valido o campagna chiusa.')
        setLoading(false)
        return
      }
      router.push(`/${orgSlug}/survey?c=${data.campaignId}`)
    } catch {
      setError('Errore di rete. Riprova.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase())}
        placeholder="es. ABX7K2"
        maxLength={10}
        style={{
          padding: '14px 16px', borderRadius: 12, fontSize: 20, fontWeight: 700,
          letterSpacing: '0.2em', textAlign: 'center', fontFamily: font,
          border: `1.5px solid ${error ? '#dc2626' : colors.borderMid}`,
          background: '#fafaf9', color: colors.ink, outline: 'none',
        }}
      />
      {error && <p style={{ fontFamily: font, fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}
      <button type="submit" disabled={loading || !code.trim()} style={{
        padding: '13px 24px', borderRadius: 12, border: 'none',
        background: loading || !code.trim() ? colors.borderMid : colors.ink,
        color: loading || !code.trim() ? colors.faint : colors.wheat,
        fontSize: 14, fontWeight: 700, cursor: loading || !code.trim() ? 'default' : 'pointer',
        fontFamily: font,
      }}>
        {loading ? 'Verifica…' : 'Inizia la survey →'}
      </button>
    </form>
  )
}
