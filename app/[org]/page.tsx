import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AccessCodeForm from './AccessCodeForm'
import { font, fontD, colors } from '@/lib/design'

interface Props { params: Promise<{ org: string }> }

export default async function OrgLandingPage({ params }: Props) {
  const { org: slug } = await params
  const supabase = await createClient()

  const { data: organization } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (!organization) notFound()

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef', fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
        <div style={{ fontFamily: fontD, fontSize: 20, color: colors.ink, marginBottom: 32 }}>
          Venturo<span style={{ color: colors.gold }}>.</span> Happiness
        </div>
        <div style={{
          background: '#fff', borderRadius: 20, padding: '40px 32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.03)',
          border: '1px solid #f0ede8',
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔐</div>
          <h1 style={{ fontFamily: fontD, fontSize: 24, color: colors.ink, marginBottom: 8, fontWeight: 600 }}>
            {organization.name}
          </h1>
          <p style={{ fontFamily: font, fontSize: 13, color: colors.muted, lineHeight: 1.7, marginBottom: 28 }}>
            Inserisci il codice di accesso fornito dalla tua azienda per partecipare alla survey.
          </p>
          <AccessCodeForm orgSlug={slug} orgId={organization.id} />
        </div>
        <p style={{ fontFamily: font, fontSize: 11, color: colors.faint, marginTop: 20 }}>
          Survey anonima · I tuoi dati non vengono tracciati individualmente
        </p>
      </div>
    </div>
  )
}
