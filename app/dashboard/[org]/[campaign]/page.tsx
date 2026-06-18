import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import BarChart from '@/components/BarChart'
import Sparkline from '@/components/Sparkline'
import { font, fontD, colors, card } from '@/lib/design'
import { computeDimensions, computeOverall, computeByRole, computeTrend, getLevel, fmtDate, avg } from '@/lib/analytics'
import type { Response } from '@/lib/types'

interface Props {
  params: Promise<{ org: string; campaign: string }>
}

export default async function CampaignResultsPage({ params }: Props) {
  const { org: orgSlug, campaign: campaignId } = await params
  const supabase = await createAdminClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, name, status, access_code, created_at, closed_at, organizations(name, slug)')
    .eq('id', campaignId)
    .single()

  if (!campaign) notFound()
  const org = campaign.organizations as { name: string; slug: string } | null
  if (!org || org.slug !== orgSlug) notFound()

  const { data: rawResponses } = await supabase
    .from('responses')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true })

  const responses = (rawResponses ?? []) as Response[]
  const overall = responses.length ? computeOverall(responses) : 0
  const dims = computeDimensions(responses)
  const byRole = computeByRole(responses)
  const trend = computeTrend(responses)
  const lv = getLevel(overall)
  const sorted = [...dims].sort((a, b) => b.value - a.value)
  const top3 = sorted.slice(0, 3)
  const bot3 = sorted.slice(-3).reverse()
  const openAnswers = responses.filter(r => r.open_answer)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link href={`/dashboard/${orgSlug}`} style={{ fontFamily: font, fontSize: 12, color: colors.faint, textDecoration: 'none' }}>
          ← {org.name}
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
          <div>
            <h1 style={{ fontFamily: fontD, fontSize: 28, color: colors.ink, marginBottom: 4 }}>{campaign.name}</h1>
            <p style={{ fontFamily: font, fontSize: 12, color: colors.faint }}>
              {fmtDate(campaign.created_at)}{campaign.closed_at ? ` → ${fmtDate(campaign.closed_at)}` : ' · in corso'} · {responses.length} risposte
            </p>
          </div>
          <span style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: font,
            background: campaign.status === 'active' ? '#ecfdf5' : '#f5f5f4',
            color: campaign.status === 'active' ? '#059669' : '#78716c',
            alignSelf: 'flex-start',
          }}>{campaign.status === 'active' ? 'Attiva · ' + campaign.access_code : 'Chiusa'}</span>
        </div>
      </div>

      {responses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <p style={{ fontFamily: font, fontSize: 14, color: colors.muted }}>Nessuna risposta ancora.</p>
          {campaign.status === 'active' && (
            <p style={{ fontFamily: font, fontSize: 13, color: colors.faint }}>
              Condividi il link: <strong>{`/${orgSlug}`}</strong> con il codice <strong>{campaign.access_code}</strong>
            </p>
          )}
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 20 }}>
            <div style={{ ...card, textAlign: 'center', background: lv.bg }}>
              <div style={{ fontSize: 42, fontFamily: fontD, fontWeight: 700, color: lv.color }}>{overall.toFixed(1)}</div>
              <div style={{ fontSize: 13, color: '#44403c', fontFamily: font, marginTop: 2 }}>{lv.label}</div>
              <div style={{ fontSize: 10, color: colors.faint, fontFamily: font, marginTop: 6 }}>Happiness Score</div>
            </div>
            <div style={card}>
              <div style={{ fontSize: 10, color: colors.faint, fontFamily: font, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Per ruolo</div>
              {[
                { icon: '🎯', label: 'Manager', val: byRole.manager, count: byRole.managerCount },
                { icon: '💡', label: 'IC', val: byRole.ic, count: byRole.icCount },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#44403c', fontFamily: font }}>{r.icon} {r.label} <span style={{ color: colors.faint }}>({r.count})</span></span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: colors.ink, fontFamily: font }}>{r.val !== null ? r.val.toFixed(1) : '–'}</span>
                </div>
              ))}
              {byRole.manager !== null && byRole.ic !== null && (
                <div style={{ fontSize: 10, color: Math.abs(byRole.manager - byRole.ic) > 0.5 ? '#ea580c' : '#059669', fontFamily: font, marginTop: 4 }}>
                  Gap: {Math.abs(byRole.manager - byRole.ic).toFixed(1)} {Math.abs(byRole.manager - byRole.ic) > 0.5 ? '⚠️ significativo' : '✓ contenuto'}
                </div>
              )}
            </div>
            <div style={card}>
              <div style={{ fontSize: 10, color: colors.faint, fontFamily: font, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Trend risposte</div>
              {trend.points.length >= 2 ? (
                <>
                  <Sparkline points={trend.points} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: colors.faint, fontFamily: font }}>
                    <span>{fmtDate(trend.dates[0])}</span>
                    <span>{fmtDate(trend.dates[trend.dates.length - 1])}</span>
                  </div>
                </>
              ) : <p style={{ fontSize: 11, color: colors.faint, fontFamily: font }}>Servono dati su più giorni.</p>}
            </div>
          </div>

          {/* Bar chart */}
          <div style={{ ...card, marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: colors.faint, fontFamily: font, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Punteggio per dimensione</div>
            <BarChart data={dims} />
          </div>

          {/* Strengths / improvements */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 20 }}>
            <div style={card}>
              <div style={{ fontSize: 10, color: '#059669', fontFamily: font, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 700 }}>💪 Punti di forza</div>
              {top3.map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 2 ? '1px solid #f5f5f4' : 'none' }}>
                  <span style={{ fontSize: 13, color: '#44403c', fontFamily: font }}>{d.dim}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#059669', fontFamily: font }}>{d.value.toFixed(1)}</span>
                </div>
              ))}
            </div>
            <div style={card}>
              <div style={{ fontSize: 10, color: '#ea580c', fontFamily: font, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 700 }}>⚡ Aree di miglioramento</div>
              {bot3.map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 2 ? '1px solid #f5f5f4' : 'none' }}>
                  <span style={{ fontSize: 13, color: '#44403c', fontFamily: font }}>{d.dim}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#ea580c', fontFamily: font }}>{d.value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Management insight */}
          <div style={{ ...card, background: '#faf8f4', marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: '#92700c', fontFamily: font, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 700 }}>💡 Insight per il management</div>
            <p style={{ fontFamily: font, fontSize: 13, color: '#44403c', lineHeight: 1.8, margin: 0 }}>
              {overall >= 4.0
                ? `Benessere elevato (${overall.toFixed(1)}/5). "${top3[0].dim}" e "${top3[1].dim}" sono solide. Monitorare "${bot3[0].dim}" per margine di crescita.`
                : overall >= 3.0
                ? `Score ${overall.toFixed(1)}/5: margini di miglioramento. "${bot3[0].dim}" e "${bot3[1].dim}" richiedono attenzione prioritaria.`
                : `Score ${overall.toFixed(1)}/5: criticità. "${bot3[0].dim}" (${bot3[0].value.toFixed(1)}) e "${bot3[1].dim}" (${bot3[1].value.toFixed(1)}) necessitano intervento urgente.`
              }
              {byRole.manager !== null && byRole.ic !== null && Math.abs(byRole.manager - byRole.ic) > 0.5
                ? ` Gap Manager/IC di ${Math.abs(byRole.manager - byRole.ic).toFixed(1)} punti — merita indagine.`
                : ''}
            </p>
          </div>

          {/* Open answers */}
          {openAnswers.length > 0 && (
            <div style={{ ...card, marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: colors.ink, fontFamily: font, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 700 }}>
                💬 Cosa cambierebbero — {openAnswers.length} rispost{openAnswers.length === 1 ? 'a' : 'e'}
              </div>
              {openAnswers.map((r, i) => {
                const sc = avg(Object.values(r.answers))
                const al = getLevel(sc)
                return (
                  <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: '#fafaf9', border: '1px solid #f0ede8', marginBottom: i < openAnswers.length - 1 ? 10 : 0 }}>
                    <p style={{ fontFamily: font, fontSize: 13, color: '#44403c', lineHeight: 1.7, margin: 0 }}>&quot;{r.open_answer}&quot;</p>
                    <div style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: 10, color: colors.faint, fontFamily: font, flexWrap: 'wrap' }}>
                      <span>{r.role === 'Manager' ? '🎯' : r.role === 'Individual Contributor' ? '💡' : '👤'} {r.role}</span>
                      <span>·</span>
                      <span>Score: <span style={{ color: al.color, fontWeight: 600 }}>{sc.toFixed(1)}</span></span>
                      <span>·</span>
                      <span>{fmtDate(r.created_at)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
