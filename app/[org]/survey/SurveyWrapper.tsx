'use client'
import { useState } from 'react'
import SurveyForm from '@/components/SurveyForm'
import { font, fontD, colors } from '@/lib/design'

interface Props { orgName: string; campaignId: string; orgSlug: string }

export default function SurveyWrapper({ orgName, campaignId, orgSlug }: Props) {
  const [done, setDone] = useState(false)

  if (done) return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef', fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🌟</div>
        <h1 style={{ fontFamily: fontD, fontSize: 30, color: colors.ink, marginBottom: 10 }}>Grazie!</h1>
        <p style={{ fontFamily: font, fontSize: 14, color: colors.muted, lineHeight: 1.8 }}>
          Le tue risposte sono state registrate in modo anonimo.<br />Il tuo contributo è prezioso per migliorare il benessere in azienda.
        </p>
        <div style={{ marginTop: 32, padding: '16px 20px', borderRadius: 12, background: '#fff', border: '1px solid #f0ede8', display: 'inline-block' }}>
          <p style={{ fontFamily: font, fontSize: 12, color: colors.faint, margin: 0 }}>{orgName}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef' }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100, padding: '12px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(245,243,239,0.88)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #ece9e3',
      }}>
        <div style={{ fontFamily: fontD, fontSize: 17, color: colors.ink }}>
          Venturo<span style={{ color: colors.gold }}>.</span> Happiness
        </div>
        <div style={{ fontFamily: font, fontSize: 12, color: colors.faint }}>{orgName}</div>
      </nav>
      <SurveyForm orgName={orgName} campaignId={campaignId} onComplete={() => setDone(true)} />
    </div>
  )
}
