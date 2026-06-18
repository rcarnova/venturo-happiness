import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import SurveyWrapper from './SurveyWrapper'

interface Props {
  params: Promise<{ org: string }>
  searchParams: Promise<{ c?: string }>
}

export default async function SurveyPage({ params, searchParams }: Props) {
  const { org: slug } = await params
  const { c: campaignId } = await searchParams

  if (!campaignId) redirect(`/${slug}`)

  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, name, status, organizations(name, slug)')
    .eq('id', campaignId)
    .eq('status', 'active')
    .single()

  if (!campaign) notFound()

  const org = campaign.organizations as { name: string; slug: string } | null
  if (!org || org.slug !== slug) notFound()

  return <SurveyWrapper orgName={org.name} campaignId={campaignId} orgSlug={slug} />
}
