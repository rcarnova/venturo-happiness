'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { font, colors } from '@/lib/design'

interface Props { campaignId: string; currentStatus: string }

export default function CampaignActions({ campaignId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (currentStatus !== 'active') return null

  const close = async () => {
    if (!confirm('Chiudere questa campagna? I dipendenti non potranno più rispondere.')) return
    setLoading(true)
    await fetch('/api/admin/campaigns', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, status: 'closed' }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <button onClick={close} disabled={loading} style={{
      padding: '8px 12px', borderRadius: 8, border: `1px solid ${colors.borderMid}`,
      background: '#fff', color: colors.muted, fontSize: 11,
      cursor: loading ? 'default' : 'pointer', fontFamily: font, fontWeight: 500,
    }}>{loading ? '…' : 'Chiudi'}</button>
  )
}
