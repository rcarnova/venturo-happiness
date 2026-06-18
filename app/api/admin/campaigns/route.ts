import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateCode } from '@/lib/analytics'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'superadmin') return NextResponse.json({ error: 'Accesso negato.' }, { status: 403 })

  const { orgId, name } = await req.json()
  if (!orgId || !name) return NextResponse.json({ error: 'orgId e name richiesti.' }, { status: 400 })

  const adminSupabase = await createAdminClient()

  // Generate a unique code for this org
  let code = generateCode()
  let attempts = 0
  while (attempts < 10) {
    const { data: existing } = await adminSupabase
      .from('campaigns')
      .select('id')
      .eq('org_id', orgId)
      .eq('access_code', code)
      .single()
    if (!existing) break
    code = generateCode()
    attempts++
  }

  const { data, error } = await adminSupabase
    .from('campaigns')
    .insert({ org_id: orgId, name, access_code: code, status: 'active' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role, org_id').eq('id', user.id).single()
  if (!profile || !['superadmin', 'hr'].includes(profile.role)) {
    return NextResponse.json({ error: 'Accesso negato.' }, { status: 403 })
  }

  const { campaignId, status } = await req.json()
  if (!campaignId || !status) return NextResponse.json({ error: 'campaignId e status richiesti.' }, { status: 400 })

  const adminSupabase = await createAdminClient()

  // HR can only close campaigns for their own org
  if (profile.role === 'hr') {
    const { data: campaign } = await adminSupabase.from('campaigns').select('org_id').eq('id', campaignId).single()
    if (!campaign || campaign.org_id !== profile.org_id) {
      return NextResponse.json({ error: 'Accesso negato.' }, { status: 403 })
    }
  }

  const updatePayload = status === 'closed'
    ? { status: 'closed' as const, closed_at: new Date().toISOString() }
    : { status: 'active' as const }

  const { data, error } = await adminSupabase.from('campaigns').update(updatePayload).eq('id', campaignId).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
