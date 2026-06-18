import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'superadmin') return NextResponse.json({ error: 'Accesso negato.' }, { status: 403 })

  const { email, password, orgId, role } = await req.json()
  if (!email || !password || !orgId) {
    return NextResponse.json({ error: 'email, password e orgId richiesti.' }, { status: 400 })
  }

  const adminSupabase = await createAdminClient()

  // Create auth user
  const { data: newUser, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { role: role ?? 'hr' },
    email_confirm: true,
  })

  if (authError || !newUser.user) {
    return NextResponse.json({ error: authError?.message ?? 'Errore creazione utente.' }, { status: 500 })
  }

  // Update profile with org_id (trigger creates it with hr role)
  const { error: profileError } = await adminSupabase
    .from('profiles')
    .update({ org_id: orgId, role: role ?? 'hr' })
    .eq('id', newUser.user.id)

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({ id: newUser.user.id, email }, { status: 201 })
}
