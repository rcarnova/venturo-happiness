'use client'
import { font, fontD, colors } from '@/lib/design'

export default function DashboardNav() {
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
        <a href="/admin" style={{ fontSize: 11, fontFamily: font, color: colors.muted, textDecoration: 'none', padding: '4px 10px', borderRadius: 6, border: '1px solid #e7e5e4', background: '#faf5eb' }}>
          Admin
        </a>
      </div>
    </nav>
  )
}
