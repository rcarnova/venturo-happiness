import { ITEMS, type Response } from './types'

export function avg(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

export function getLevel(score: number) {
  if (score >= 4.2) return { label: 'Eccellente', color: '#059669', bg: '#ecfdf5' }
  if (score >= 3.5) return { label: 'Buono', color: '#65a30d', bg: '#f7fee7' }
  if (score >= 2.8) return { label: 'Nella media', color: '#ca8a04', bg: '#fefce8' }
  if (score >= 2.0) return { label: 'Critico', color: '#ea580c', bg: '#fff7ed' }
  return { label: 'Molto critico', color: '#dc2626', bg: '#fef2f2' }
}

export function computeDimensions(responses: Response[]) {
  return ITEMS.map(item => {
    const vals = responses.map(r => r.answers[item.id]).filter(Boolean)
    return { id: item.id, dim: item.dim, value: avg(vals), count: vals.length }
  })
}

export function computeOverall(responses: Response[]) {
  const allScores = responses.flatMap(r => Object.values(r.answers))
  return avg(allScores)
}

export function computeByRole(responses: Response[]) {
  const mgrs = responses.filter(r => r.role === 'Manager')
  const ics = responses.filter(r => r.role === 'Individual Contributor')
  return {
    manager: mgrs.length ? computeOverall(mgrs) : null,
    ic: ics.length ? computeOverall(ics) : null,
    managerCount: mgrs.length,
    icCount: ics.length,
  }
}

export function computeTrend(responses: Response[]) {
  const byDate: Record<string, number[]> = {}
  responses.forEach(r => {
    const day = r.created_at.slice(0, 10)
    if (!byDate[day]) byDate[day] = []
    byDate[day].push(avg(Object.values(r.answers)))
  })
  const dates = Object.keys(byDate).sort()
  return { dates, points: dates.map(d => avg(byDate[d])) }
}

export interface CampaignSummary {
  id: string
  name: string
  createdAt: string
  status: string
  responseCount: number
  overall: number
  dimensions: ReturnType<typeof computeDimensions>
}

export function diffCampaigns(a: CampaignSummary, b: CampaignSummary) {
  const dimDiffs = a.dimensions.map(da => {
    const db = b.dimensions.find(d => d.id === da.id)!
    return { id: da.id, dim: da.dim, before: db.value, after: da.value, delta: da.value - db.value }
  })
  return {
    overallDelta: a.overall - b.overall,
    dimensions: dimDiffs,
  }
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function generateCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
