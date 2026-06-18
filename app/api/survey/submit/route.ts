import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { campaignId, answers, role, openAnswer } = await req.json()

  if (!campaignId || !answers || typeof answers !== 'object') {
    return NextResponse.json({ error: 'Dati non validi.' }, { status: 400 })
  }

  // Validate answers: must be 10 items, values 1–5
  const ids = Object.keys(answers).map(Number)
  if (ids.length !== 10 || ids.some(id => id < 1 || id > 10)) {
    return NextResponse.json({ error: 'Risposte incomplete.' }, { status: 400 })
  }
  if (Object.values(answers).some((v: unknown) => typeof v !== 'number' || (v as number) < 1 || (v as number) > 5)) {
    return NextResponse.json({ error: 'Valori non validi.' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  // Verify campaign is still active
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, status')
    .eq('id', campaignId)
    .eq('status', 'active')
    .single()

  if (!campaign) {
    return NextResponse.json({ error: 'Campagna non trovata o chiusa.' }, { status: 404 })
  }

  const { error } = await supabase.from('responses').insert({
    campaign_id: campaignId,
    answers,
    role: role || 'Non specificato',
    open_answer: openAnswer || null,
  })

  if (error) {
    console.error('Insert error:', error)
    return NextResponse.json({ error: 'Errore durante il salvataggio.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
