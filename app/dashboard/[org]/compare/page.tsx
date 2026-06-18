import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { font, fontD, colors, card } from '@/lib/design'
import { computeDimensions, computeOverall, getLevel, fmtDate, diffCampaigns } from '@/lib/analytics'
import type { Response, Campaign } from '@/lib/types'
import CompareSelector from './CompareSelector'

interface Props {
  params: Promise<{ org: string }>
  searchParams: Promise<{ a?: string; b?: string }>
}

export default async function ComparePage({ params, searchParams }: Props) {
  const { org: slug } = await params
  const { a: idA, b: idB } = await searchParams

  const supabase = await createAdminClient()

  const { data: org } = await supabase.from('organizations').select('id, name, slug').eq('slug', slug).single()
  if (!org) notFound()

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, status, created_at')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false })

  const campaignList = campaigns ?? []

  async function buildSummary(c: Campaign) {
    const { data: responses } = await supabase.from('responses').select('*').eq('campaign_id', c.id)
    const rs = (responses ?? []) as Response[]
    return {
      id: c.id,
      name: c.name,
      createdAt: c.created_at,
      status: c.status,
      responseCount: rs.length,
      overall: rs.length ? computeOverall(rs) : 0,
      dimensions: computeDimensions(rs),
    }
  }

  const summaryA = idA ? await buildSummary(campaignList.find(c => c.id === idA) as Campaign) : null
  const summaryB = idB ? await buildSummary(campaignList.find(c => c.id === idB) as Campaign) : null
  const diff = summaryA && summaryB ? diffCampaigns(summaryA, summaryB) : null

  return (
    <div>
      <Link href={`/dashboard/${slug}`} style={{ fontFamily: font, fontSize: 12, color: colors.faint, textDecoration: 'none' }}>
        ← {org.name}
      </Link>
      <h1 style={{ fontFamily: fontD, fontSize: 28, color: colors.ink, marginTop: 8, marginBottom: 4 }}>Confronto campagne</h1>
      <p style={{ fontFamily: font, fontSize: 13, color: colors.faint, marginBottom: 28 }}>Seleziona due campagne per vedere come è cambiato il benessere nel tempo.</p>

      <CompareSelector
        campaigns={campaignList.map(c => ({ id: c.id, name: c.name, date: c.created_at }))}
        orgSlug={slug}
        selectedA={idA}
        selectedB={idB}
      />

      {summaryA && summaryB && diff && (
        <div style={{ marginTop: 32 }}>
          {/* Overall delta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', marginBottom: 24 }}>
            <ScoreCard summary={summaryA} label="Più recente" />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: fontD, fontSize: 28, fontWeight: 700, color: diff.overallDelta > 0 ? '#059669' : diff.overallDelta < 0 ? '#dc2626' : colors.faint }}>
                {diff.overallDelta > 0 ? '+' : ''}{diff.overallDelta.toFixed(2)}
              </div>
              <div style={{ fontFamily: font, fontSize: 10, color: colors.faint, marginTop: 2 }}>Δ Score</div>
            </div>
            <ScoreCard summary={summaryB} label="Precedente" />
          </div>

          {/* Dimension deltas */}
          <div style={card}>
            <div style={{ fontSize: 10, color: colors.faint, fontFamily: font, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Variazione per dimensione</div>
            {diff.dimensions.sort((a, b) => b.delta - a.delta).map((d, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 60px 60px 60px', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: i < diff.dimensions.length - 1 ? '1px solid #f5f5f4' : 'none' }}>
                <span style={{ fontFamily: font, fontSize: 12, color: '#44403c' }}>{d.dim}</span>
                <div style={{ position: 'relative', height: 6, background: '#f0ede8', borderRadius: 3 }}>
                  <div style={{
                    position: 'absolute', height: '100%', borderRadius: 3,
                    background: d.delta > 0 ? '#059669' : d.delta < 0 ? '#dc2626' : '#a8a29e',
                    width: `${Math.min(100, Math.abs(d.delta) / 4 * 100)}%`,
                    left: d.delta >= 0 ? '50%' : `calc(50% - ${Math.min(50, Math.abs(d.delta) / 4 * 100)}%)`,
                  }} />
                  <div style={{ position: 'absolute', left: '50%', top: -1, width: 1, height: 8, background: '#d6d3d1' }} />
                </div>
                <span style={{ fontFamily: font, fontSize: 11, color: colors.faint, textAlign: 'center' }}>{d.before.toFixed(1)}</span>
                <span style={{ fontFamily: font, fontSize: 11, color: colors.faint, textAlign: 'center' }}>→</span>
                <span style={{ fontFamily: font, fontSize: 12, fontWeight: 700, color: d.delta > 0.1 ? '#059669' : d.delta < -0.1 ? '#dc2626' : '#44403c', textAlign: 'right' }}>
                  {d.after.toFixed(1)}
                  <span style={{ fontSize: 9, marginLeft: 2 }}>{d.delta > 0 ? `▲+${d.delta.toFixed(1)}` : d.delta < 0 ? `▼${d.delta.toFixed(1)}` : '='}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!idA || !idB) && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: colors.faint, fontFamily: font, fontSize: 14 }}>
          Seleziona due campagne per il confronto.
        </div>
      )}
    </div>
  )
}

function ScoreCard({ summary, label }: { summary: { name: string; createdAt: string; overall: number; responseCount: number }; label: string }) {
  const lv = getLevel(summary.overall)
  return (
    <div style={{ ...card, textAlign: 'center', background: lv.bg }}>
      <div style={{ fontFamily: font, fontSize: 10, color: colors.faint, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
      <div style={{ fontFamily: fontD, fontSize: 17, color: colors.ink, marginBottom: 4 }}>{summary.name}</div>
      <div style={{ fontFamily: fontD, fontSize: 36, fontWeight: 700, color: lv.color }}>{summary.overall.toFixed(1)}</div>
      <div style={{ fontFamily: font, fontSize: 11, color: colors.faint }}>{summary.responseCount} risposte · {fmtDate(summary.createdAt)}</div>
    </div>
  )
}
