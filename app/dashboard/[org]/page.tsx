import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { font, fontD, colors } from '@/lib/design'
import { computeOverall, fmtDate, getLevel } from '@/lib/analytics'
import type { Response } from '@/lib/types'
import CampaignActions from './CampaignActions'

interface Props { params: Promise<{ org: string }> }

export default async function OrgDashboardPage({ params }: Props) {
  const { org: slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (!org) notFound()

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, status, access_code, created_at, closed_at')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false })

  // Fetch response counts + scores per campaign
  const campaignData = await Promise.all(
    (campaigns ?? []).map(async (c) => {
      const { data: responses } = await supabase
        .from('responses')
        .select('answers')
        .eq('campaign_id', c.id)
      const overall = responses?.length ? computeOverall(responses as Response[]) : null
      return { ...c, responseCount: responses?.length ?? 0, overall }
    })
  )

  const active = campaignData.filter(c => c.status === 'active')
  const closed = campaignData.filter(c => c.status === 'closed')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: fontD, fontSize: 28, color: colors.ink, marginBottom: 4 }}>{org.name}</h1>
          <p style={{ fontFamily: font, fontSize: 12, color: colors.faint }}>{campaignData.length} campagne totali</p>
        </div>
        <Link href={`/dashboard/${slug}/compare`} style={{
          padding: '9px 20px', borderRadius: 10, border: `1px solid ${colors.borderMid}`,
          background: '#fff', color: '#44403c', fontSize: 12, fontWeight: 600,
          fontFamily: font, textDecoration: 'none', display: 'inline-block',
        }}>📊 Confronta campagne</Link>
      </div>

      {active.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: font, fontSize: 11, color: colors.faint, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Campagne attive</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {active.map(c => <CampaignCard key={c.id} campaign={c} orgSlug={slug} />)}
          </div>
        </section>
      )}

      {closed.length > 0 && (
        <section>
          <h2 style={{ fontFamily: font, fontSize: 11, color: colors.faint, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Campagne chiuse</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {closed.map(c => <CampaignCard key={c.id} campaign={c} orgSlug={slug} />)}
          </div>
        </section>
      )}

      {campaignData.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <p style={{ fontFamily: font, fontSize: 14, color: colors.muted }}>Nessuna campagna. Creane una dal pannello admin.</p>
          <Link href="/admin" style={{ fontFamily: font, fontSize: 13, color: colors.ink }}>Vai all&apos;admin →</Link>
        </div>
      )}
    </div>
  )
}

function CampaignCard({ campaign, orgSlug }: {
  campaign: { id: string; name: string; status: string; access_code: string; created_at: string; closed_at: string | null; responseCount: number; overall: number | null }
  orgSlug: string
}) {
  const lv = campaign.overall !== null ? getLevel(campaign.overall) : null

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '20px 22px',
      border: '1px solid #f0ede8',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: fontD, fontSize: 17, color: colors.ink, marginBottom: 2 }}>{campaign.name}</div>
          <div style={{ fontFamily: font, fontSize: 11, color: colors.faint }}>{fmtDate(campaign.created_at)}</div>
        </div>
        <span style={{
          padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, fontFamily: font,
          background: campaign.status === 'active' ? '#ecfdf5' : '#f5f5f4',
          color: campaign.status === 'active' ? '#059669' : '#78716c',
        }}>{campaign.status === 'active' ? 'Attiva' : 'Chiusa'}</span>
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: font, fontSize: 22, fontWeight: 700, color: lv?.color ?? colors.faint }}>
            {campaign.overall !== null ? campaign.overall.toFixed(1) : '–'}
          </div>
          <div style={{ fontFamily: font, fontSize: 10, color: colors.faint }}>Score medio</div>
        </div>
        <div>
          <div style={{ fontFamily: font, fontSize: 22, fontWeight: 700, color: colors.ink }}>{campaign.responseCount}</div>
          <div style={{ fontFamily: font, fontSize: 10, color: colors.faint }}>Risposte</div>
        </div>
      </div>

      {campaign.status === 'active' && (
        <div style={{ padding: '8px 12px', borderRadius: 8, background: '#faf5eb', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: font, fontSize: 11, color: '#92700c' }}>Codice accesso:</span>
          <span style={{ fontFamily: font, fontSize: 14, fontWeight: 700, color: '#92700c', letterSpacing: '0.15em' }}>{campaign.access_code}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <Link href={`/dashboard/${orgSlug}/${campaign.id}`} style={{
          flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
          background: colors.ink, color: colors.wheat,
          fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: font,
          textDecoration: 'none', textAlign: 'center', display: 'block',
        }}>Vedi risultati →</Link>
        <CampaignActions campaignId={campaign.id} currentStatus={campaign.status} />
      </div>
    </div>
  )
}
