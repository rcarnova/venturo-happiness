import { createAdminClient } from '@/lib/supabase/server'
import { font, fontD, colors, card } from '@/lib/design'
import { fmtDate } from '@/lib/analytics'
import CreateOrgForm from './CreateOrgForm'
import CreateCampaignForm from './CreateCampaignForm'
import CreateUserForm from './CreateUserForm'

export default async function AdminPage() {
  const supabase = await createAdminClient()

  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, slug, created_at')
    .order('name')

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, status, access_code, created_at, org_id, organizations(name, slug)')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef', fontFamily: font }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100, padding: '12px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(245,243,239,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #ece9e3',
      }}>
        <div style={{ fontFamily: fontD, fontSize: 17, color: colors.ink }}>
          Venturo<span style={{ color: colors.gold }}>.</span> Happiness <span style={{ fontSize: 12, color: colors.faint, fontFamily: font }}>/ Admin</span>
        </div>
        <a href="/dashboard" style={{ fontFamily: font, fontSize: 12, color: colors.muted, textDecoration: 'none' }}>← Dashboard</a>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontFamily: fontD, fontSize: 28, color: colors.ink, marginBottom: 32 }}>Pannello Admin</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 40 }}>
          <div style={card}>
            <h2 style={{ fontFamily: fontD, fontSize: 18, color: colors.ink, marginBottom: 16 }}>Nuova organizzazione</h2>
            <CreateOrgForm />
          </div>
          <div style={card}>
            <h2 style={{ fontFamily: fontD, fontSize: 18, color: colors.ink, marginBottom: 16 }}>Nuova campagna</h2>
            <CreateCampaignForm orgs={(orgs ?? []).map(o => ({ id: o.id, name: o.name }))} />
          </div>
          <div style={card}>
            <h2 style={{ fontFamily: fontD, fontSize: 18, color: colors.ink, marginBottom: 16 }}>Nuovo utente HR</h2>
            <CreateUserForm orgs={(orgs ?? []).map(o => ({ id: o.id, name: o.name }))} />
          </div>
        </div>

        {/* Orgs table */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: fontD, fontSize: 20, color: colors.ink, marginBottom: 14 }}>Organizzazioni ({orgs?.length ?? 0})</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font }}>
              <thead>
                <tr style={{ background: '#fafaf9', borderBottom: '1px solid #f0ede8' }}>
                  {['Nome', 'Slug', 'Creata', 'Link survey'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, color: colors.faint, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(orgs ?? []).map((o, i) => (
                  <tr key={o.id} style={{ borderBottom: i < (orgs?.length ?? 0) - 1 ? '1px solid #f0ede8' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: colors.ink, fontWeight: 600 }}>{o.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: colors.faint }}>{o.slug}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: colors.faint }}>{fmtDate(o.created_at)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12 }}>
                      <a href={`/${o.slug}`} target="_blank" style={{ color: colors.ink, textDecoration: 'none' }}>/{o.slug} ↗</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Campaigns table */}
        <section>
          <h2 style={{ fontFamily: fontD, fontSize: 20, color: colors.ink, marginBottom: 14 }}>Campagne recenti</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font }}>
              <thead>
                <tr style={{ background: '#fafaf9', borderBottom: '1px solid #f0ede8' }}>
                  {['Campagna', 'Organizzazione', 'Codice', 'Stato', 'Data'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, color: colors.faint, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(campaigns ?? []).map((c, i) => {
                  const org = c.organizations as { name: string; slug: string } | null
                  return (
                    <tr key={c.id} style={{ borderBottom: i < (campaigns?.length ?? 0) - 1 ? '1px solid #f0ede8' : 'none' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: colors.ink, fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: colors.faint }}>{org?.name ?? '–'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#92700c', letterSpacing: '0.1em' }}>{c.access_code}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                          background: c.status === 'active' ? '#ecfdf5' : '#f5f5f4',
                          color: c.status === 'active' ? '#059669' : '#78716c',
                        }}>{c.status === 'active' ? 'Attiva' : 'Chiusa'}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: colors.faint }}>{fmtDate(c.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
