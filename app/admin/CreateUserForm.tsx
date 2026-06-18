'use client'
import { useState } from 'react'
import { font, colors } from '@/lib/design'

interface Props { orgs: { id: string; name: string }[] }

export default function CreateUserForm({ orgs }: Props) {
  const [orgId, setOrgId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, orgId, role: 'hr' }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Errore'); setLoading(false); return }
    setSuccess(`Utente ${email} creato.`)
    setEmail(''); setPassword(''); setOrgId('')
    setLoading(false)
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
        <label style={{ fontSize: 10, color: colors.faint, fontFamily: font, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Email HR</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
      </div>
      <div>
        <label style={{ fontSize: 10, color: colors.faint, fontFamily: font, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Password temporanea</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required style={inputStyle} />
      </div>
      {error && <p style={{ fontSize: 11, color: '#dc2626', fontFamily: font, margin: 0 }}>{error}</p>}
      {success && <p style={{ fontSize: 11, color: '#059669', fontFamily: font, margin: 0 }}>{success}</p>}
      <button type="submit" disabled={loading} style={{
        padding: '10px 16px', borderRadius: 8, border: 'none',
        background: loading ? colors.borderMid : colors.ink,
        color: loading ? colors.faint : colors.wheat,
        fontSize: 13, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: font,
      }}>{loading ? 'Creazione…' : 'Crea utente HR'}</button>
    </form>
  )
}
