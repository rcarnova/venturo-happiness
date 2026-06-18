import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { email, password, orgId, role } = await req.json()
  if (!email || !password || !orgId) {
    return NextResponse.json({ error: 'email, password e orgId richiesti.' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { role: role ?? 'hr' },
    email_confirm: true,
  })

  if (authError || !newUser.user) {
    return NextResponse.json({ error: authError?.message ?? 'Errore creazione utente.' }, { status: 500 })
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ org_id: orgId, role: role ?? 'hr' })
    .eq('id', newUser.user.id)

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({ id: newUser.user.id, email }, { status: 201 })
}
