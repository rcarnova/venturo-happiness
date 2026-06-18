import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateCode } from '@/lib/analytics'

export async function POST(req: NextRequest) {
  const { orgId, name } = await req.json()
  if (!orgId || !name) return NextResponse.json({ error: 'orgId e name richiesti.' }, { status: 400 })

  const supabase = await createAdminClient()

  let code = generateCode()
  for (let i = 0; i < 10; i++) {
    const { data: existing } = await supabase.from('campaigns').select('id').eq('org_id', orgId).eq('access_code', code).single()
    if (!existing) break
    code = generateCode()
  }

  const { data, error } = await supabase
    .from('campaigns')
    .insert({ org_id: orgId, name, access_code: code, status: 'active' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const { campaignId, status } = await req.json()
  if (!campaignId || !status) return NextResponse.json({ error: 'campaignId e status richiesti.' }, { status: 400 })

  const supabase = await createAdminClient()
  const updatePayload = status === 'closed'
    ? { status: 'closed' as const, closed_at: new Date().toISOString() }
    : { status: 'active' as const }

  const { data, error } = await supabase.from('campaigns').update(updatePayload).eq('id', campaignId).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
