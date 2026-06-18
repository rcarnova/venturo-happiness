import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { font, fontD, colors } from '@/lib/design'
import { fmtDate } from '@/lib/analytics'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, org_id')
    .eq('id', user.id)
    .single()

  // HR: redirect straight to their org
  if (profile?.role === 'hr' && profile.org_id) {
    const { data: org } = await supabase.from('organizations').select('slug').eq('id', profile.org_id).single()
    if (org) redirect(`/dashboard/${org.slug}`)
  }

  // Superadmin: show org list
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, slug, created_at')
    .order('name')

  return (
    <div>
      <h1 style={{ fontFamily: fontD, fontSize: 28, color: colors.ink, marginBottom: 6 }}>Organizzazioni</h1>
      <p style={{ fontFamily: font, fontSize: 13, color: colors.faint, marginBottom: 28 }}>
        {orgs?.length ?? 0} clienti registrati
      </p>
      {!orgs?.length ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
          <p style={{ fontFamily: font, fontSize: 14, color: colors.muted }}>Nessuna organizzazione. <Link href="/admin" style={{ color: colors.ink }}>Crea la prima →</Link></p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {orgs.map(org => (
            <Link key={org.id} href={`/dashboard/${org.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff', borderRadius: 16, padding: '20px 24px',
                border: '1px solid #f0ede8',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                cursor: 'pointer', transition: 'box-shadow 0.2s',
              }}>
                <div style={{ fontFamily: fontD, fontSize: 18, color: colors.ink, marginBottom: 4 }}>{org.name}</div>
                <div style={{ fontFamily: font, fontSize: 11, color: colors.faint }}>/{org.slug}</div>
                <div style={{ fontFamily: font, fontSize: 11, color: colors.faint, marginTop: 12 }}>
                  Creata il {fmtDate(org.created_at)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
