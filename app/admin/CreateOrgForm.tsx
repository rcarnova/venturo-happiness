'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { font, colors } from '@/lib/design'

export default function CreateOrgForm() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleNameChange = (v: string) => {
    setName(v)
    setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    const res = await fetch('/api/admin/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Errore'); setLoading(false); return }
    setSuccess(`Creata! Link: /${data.slug}`)
    setName(''); setSlug('')
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
        <label style={{ fontSize: 10, color: colors.faint, fontFamily: font, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Nome azienda</label>
        <input value={name} onChange={e => handleNameChange(e.target.value)} placeholder="Acme S.p.A." required style={inputStyle} />
      </div>
      <div>
        <label style={{ fontSize: 10, color: colors.faint, fontFamily: font, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Slug URL</label>
        <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="acme" required style={inputStyle} />
        <span style={{ fontSize: 10, color: colors.faint, fontFamily: font }}>/{slug || 'slug'}</span>
      </div>
      {error && <p style={{ fontSize: 11, color: '#dc2626', fontFamily: font, margin: 0 }}>{error}</p>}
      {success && <p style={{ fontSize: 11, color: '#059669', fontFamily: font, margin: 0 }}>{success}</p>}
      <button type="submit" disabled={loading} style={{
        padding: '10px 16px', borderRadius: 8, border: 'none',
        background: loading ? colors.borderMid : colors.ink,
        color: loading ? colors.faint : colors.wheat,
        fontSize: 13, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: font,
      }}>{loading ? 'Creazione…' : 'Crea organizzazione'}</button>
    </form>
  )
}
