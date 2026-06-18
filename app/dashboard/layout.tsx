import DashboardNav from './DashboardNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef' }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <DashboardNav />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
        {children}
      </main>
    </div>
  )
}
