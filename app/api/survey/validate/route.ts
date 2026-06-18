import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { orgId, code } = await req.json()

  if (!orgId || !code) {
    return NextResponse.json({ error: 'Parametri mancanti.' }, { status: 400 })
  }

  const supabase = await createAdminClient()
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, status')
    .eq('org_id', orgId)
    .eq('access_code', code.trim().toUpperCase())
    .single()

  if (!campaign) {
    return NextResponse.json({ error: 'Codice non valido.' }, { status: 404 })
  }

  if (campaign.status !== 'active') {
    return NextResponse.json({ error: 'Questa campagna è chiusa.' }, { status: 403 })
  }

  return NextResponse.json({ campaignId: campaign.id })
}
