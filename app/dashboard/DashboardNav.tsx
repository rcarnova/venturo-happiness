'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { font, fontD, colors } from '@/lib/design'

interface Props {
  email: string
  role: string
  orgName: string | null
  orgSlug: string | null
}

export default function DashboardNav({ email, role, orgName, orgSlug }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100, padding: '12px 20px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'rgba(245,243,239,0.92)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #ece9e3',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontFamily: fontD, fontSize: 17, color: colors.ink }}>
          Venturo<span style={{ color: colors.gold }}>.</span> Happiness
        </div>
        {role === 'superadmin' && (
          <a href="/admin" style={{ fontSize: 11, fontFamily: font, color: colors.muted, textDecoration: 'none', padding: '4px 10px', borderRadius: 6, border: '1px solid #e7e5e4', background: '#faf5eb' }}>
            Admin
          </a>
        )}
        {orgName && orgSlug && (
          <a href={`/dashboard/${orgSlug}`} style={{ fontSize: 12, fontFamily: font, color: colors.muted, textDecoration: 'none' }}>
            {orgName}
          </a>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: font, fontSize: 11, color: colors.faint }}>{email}</span>
        <button onClick={handleLogout} style={{
          padding: '5px 12px', borderRadius: 7, border: '1px solid #e7e5e4',
          background: '#fff', color: colors.muted, fontSize: 11, cursor: 'pointer', fontFamily: font,
        }}>Esci</button>
      </div>
    </nav>
  )
}
