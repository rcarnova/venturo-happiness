import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardNav from './DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, org_id, organizations(name, slug)')
    .eq('id', user.id)
    .single()

  const org = profile?.organizations as { name: string; slug: string } | null

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef' }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <DashboardNav
        email={user.email ?? ''}
        role={profile?.role ?? 'hr'}
        orgName={org?.name ?? null}
        orgSlug={org?.slug ?? null}
      />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
        {children}
      </main>
    </div>
  )
}
