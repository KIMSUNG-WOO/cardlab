import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AuthenticFinanceCard } from '@/components/templates/authentic-finance-card'
import { MinimalDarkCard } from '@/components/templates/minimal-dark-card'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: card } = await supabase
    .from('business_cards')
    .select('name, position, company_name, short_intro, profile_image_url')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!card) return { title: '명함을 찾을 수 없습니다' }

  const title = `${card.name} — ${card.position}`
  const description = card.short_intro ?? `${card.company_name} ${card.position} ${card.name}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: card.profile_image_url ? [{ url: card.profile_image_url }] : [],
    },
  }
}

export default async function SlugPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: card } = await supabase
    .from('business_cards')
    .select('*, card_links(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!card) notFound()

  const normalizedCard = {
    ...card,
    links: (card.card_links ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }

  if (card.template_key === 'minimal-dark') {
    return <MinimalDarkCard card={normalizedCard} />
  }
  return <AuthenticFinanceCard card={normalizedCard} />
}
