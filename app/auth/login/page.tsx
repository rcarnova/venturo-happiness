'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { font, fontD, colors } from '@/lib/design'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Credenziali non valide. Riprova.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: `1.5px solid ${colors.borderMid}`, background: '#fafaf9',
    fontSize: 14, fontFamily: font, color: colors.ink, outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: font }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: fontD, fontSize: 22, color: colors.ink }}>
            Venturo<span style={{ color: colors.gold }}>.</span> Happiness
          </div>
          <p style={{ fontSize: 13, color: colors.faint, marginTop: 4 }}>Area riservata</p>
        </div>
        <div style={{
          background: '#fff', borderRadius: 20, padding: '36px 32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.03)',
          border: '1px solid #f0ede8',
        }}>
          <h1 style={{ fontFamily: fontD, fontSize: 22, color: colors.ink, marginBottom: 24, fontWeight: 600 }}>Accedi</h1>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: colors.faint, fontFamily: font, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: colors.faint, fontFamily: font, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
            </div>
            {error && <p style={{ fontSize: 12, color: '#dc2626', fontFamily: font, margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{
              padding: '13px 24px', borderRadius: 12, border: 'none',
              background: loading ? colors.borderMid : colors.ink,
              color: loading ? colors.faint : colors.wheat,
              fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
              fontFamily: font, marginTop: 4,
            }}>{loading ? 'Accesso…' : 'Entra →'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
