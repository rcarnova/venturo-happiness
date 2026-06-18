'use client'
import { useState } from 'react'
import { ITEMS } from '@/lib/types'
import { font, fontD, colors } from '@/lib/design'

const LIKERT = ['Per nulla d\'accordo', 'Poco d\'accordo', 'Neutro', 'D\'accordo', 'Completamente d\'accordo']

interface Props {
  orgName: string
  campaignId: string
  onComplete: () => void
}

export default function SurveyForm({ orgName, campaignId, onComplete }: Props) {
  const [ans, setAns] = useState<Record<number, number>>({})
  const [role, setRole] = useState('')
  const [open, setOpen] = useState('')
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const total = ITEMS.length + 3
  const pct = (step / (total - 1)) * 100
  const item = step >= 1 && step <= 10 ? ITEMS[step - 1] : null

  const canNext = () => {
    if (step === 0) return true
    if (step >= 1 && step <= 10) return ans[step] !== undefined
    return true
  }

  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          answers: ans,
          role: role || 'Non specificato',
          openAnswer: open.trim() || null,
        }),
      })
      if (!res.ok) throw new Error('Errore invio')
      onComplete()
    } catch {
      setError('Errore durante l\'invio. Riprova.')
      setBusy(false)
    }
  }

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: 16,
    padding: '40px 32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.03)',
    border: '1px solid #f0ede8',
    width: '100%',
    maxWidth: 520,
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 520, marginBottom: 36 }}>
        <div style={{ height: 3, background: '#f0ede8', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: colors.ink, borderRadius: 2, transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: colors.faint, fontFamily: font }}>
          <span>{step === 0 ? 'Inizio' : step <= 10 ? `${step}/10` : step === 11 ? 'Domanda aperta' : 'Riepilogo'}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      </div>

      <div style={cardStyle}>
        {/* Step 0: welcome */}
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
            <h2 style={{ fontFamily: fontD, fontSize: 26, color: colors.ink, marginBottom: 8, fontWeight: 600 }}>Benvenuto/a</h2>
            <p style={{ fontFamily: font, fontSize: 13, color: colors.faint, marginBottom: 4 }}>{orgName}</p>
            <p style={{ fontFamily: font, fontSize: 14, color: colors.muted, lineHeight: 1.7, marginBottom: 28 }}>
              Survey anonima · circa 2 minuti · le tue risposte aiuteranno a migliorare il benessere lavorativo.
            </p>
            <p style={{ fontFamily: font, fontSize: 12, color: colors.faint, marginBottom: 14 }}>Il tuo ruolo (opzionale)</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Manager', 'Individual Contributor'].map(r => (
                <button key={r} onClick={() => setRole(r)} style={{
                  padding: '12px 24px', borderRadius: 12,
                  border: role === r ? `2px solid ${colors.ink}` : `1.5px solid ${colors.borderMid}`,
                  background: role === r ? colors.ink : '#fafaf9',
                  color: role === r ? colors.wheat : '#44403c',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: font,
                }}>
                  {r === 'Manager' ? '🎯 Manager' : '💡 Individual Contributor'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Steps 1–10: Likert items */}
        {item && (
          <div style={{ textAlign: 'center' }}>
            <span style={{
              display: 'inline-block', padding: '3px 12px', borderRadius: 20,
              background: '#faf5eb', color: '#92700c', fontSize: 11, fontWeight: 600,
              fontFamily: font, marginBottom: 20, letterSpacing: '0.4px', textTransform: 'uppercase',
            }}>{item.dim}</span>
            <h3 style={{ fontFamily: fontD, fontSize: 20, color: colors.ink, lineHeight: 1.5, marginBottom: 32, fontWeight: 500 }}>
              {item.text}
            </h3>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} title={LIKERT[n - 1]} onClick={() => setAns(p => ({ ...p, [item.id]: n }))} style={{
                  width: 46, height: 46, borderRadius: '50%',
                  border: ans[item.id] === n ? `2.5px solid ${colors.ink}` : `1.5px solid #d6d3d1`,
                  background: ans[item.id] === n ? colors.ink : '#fafaf9',
                  color: ans[item.id] === n ? colors.wheat : colors.muted,
                  fontSize: 17, fontWeight: 700, cursor: 'pointer', fontFamily: font,
                  transition: 'all 0.15s ease', transform: ans[item.id] === n ? 'scale(1.12)' : 'scale(1)',
                }}>{n}</button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 10, color: colors.faint, fontFamily: font }}>
              <span>Per nulla d&apos;accordo</span><span>Completamente d&apos;accordo</span>
            </div>
          </div>
        )}

        {/* Step 11: open question */}
        {step === 11 && (
          <div style={{ textAlign: 'center' }}>
            <span style={{
              display: 'inline-block', padding: '3px 12px', borderRadius: 20,
              background: '#faf5eb', color: '#92700c', fontSize: 11, fontWeight: 600,
              fontFamily: font, marginBottom: 20, letterSpacing: '0.4px', textTransform: 'uppercase',
            }}>La tua voce</span>
            <h3 style={{ fontFamily: fontD, fontSize: 20, color: colors.ink, lineHeight: 1.5, marginBottom: 24, fontWeight: 500 }}>
              Cosa cambieresti da domani se potessi?
            </h3>
            <textarea
              value={open} onChange={e => setOpen(e.target.value)}
              placeholder="Scrivi liberamente… (opzionale)"
              maxLength={500}
              style={{
                width: '100%', minHeight: 110, padding: 14, borderRadius: 12,
                border: `1.5px solid ${colors.borderMid}`, background: '#fafaf9', fontSize: 14,
                fontFamily: font, color: colors.ink, lineHeight: 1.7, resize: 'vertical',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            <div style={{ textAlign: 'right', fontSize: 10, color: colors.faint, fontFamily: font, marginTop: 4 }}>{open.length}/500</div>
          </div>
        )}

        {/* Step 12: summary + submit */}
        {step === 12 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>✨</div>
            <h2 style={{ fontFamily: fontD, fontSize: 26, color: colors.ink, marginBottom: 8 }}>Tutto pronto!</h2>
            <p style={{ fontFamily: font, fontSize: 14, color: colors.muted, lineHeight: 1.7, marginBottom: 28 }}>
              Punteggio medio: <strong style={{ color: colors.ink }}>{(Object.values(ans).reduce((a, b) => a + b, 0) / 10).toFixed(1)}</strong> / 5
            </p>
            {error && <p style={{ fontFamily: font, fontSize: 13, color: '#dc2626', marginBottom: 16 }}>{error}</p>}
            <button onClick={submit} disabled={busy} style={{
              padding: '14px 40px', borderRadius: 12, border: 'none',
              background: colors.ink, color: colors.wheat, fontSize: 15, fontWeight: 700,
              cursor: busy ? 'wait' : 'pointer', fontFamily: font,
              boxShadow: '0 4px 14px rgba(26,26,46,0.18)', opacity: busy ? 0.7 : 1,
            }}>{busy ? 'Invio…' : 'Invia le risposte'}</button>
          </div>
        )}

        {/* Navigation */}
        {step < 12 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36 }}>
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{
              padding: '9px 20px', borderRadius: 10, border: `1px solid ${colors.borderMid}`,
              background: '#fff', color: step === 0 ? '#d6d3d1' : '#44403c',
              fontSize: 13, cursor: step === 0 ? 'default' : 'pointer', fontFamily: font,
            }}>← Indietro</button>
            <button onClick={() => setStep(s => Math.min(12, s + 1))} disabled={!canNext()} style={{
              padding: '9px 20px', borderRadius: 10, border: 'none',
              background: canNext() ? colors.ink : colors.borderMid,
              color: canNext() ? colors.wheat : colors.faint,
              fontSize: 13, cursor: canNext() ? 'pointer' : 'default', fontFamily: font, fontWeight: 600,
            }}>Avanti →</button>
          </div>
        )}
      </div>
    </div>
  )
}
