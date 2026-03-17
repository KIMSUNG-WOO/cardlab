import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AfgDarkCard } from '@/components/templates/afg-dark-card'
import { ModernGrayCard } from '@/components/templates/modern-gray-card'
import { AfgLightCard } from '@/components/templates/afg-light-card'
import { NavyProCard } from '@/components/templates/navy-pro-card'
import { CleanWhiteCard } from '@/components/templates/clean-white-card'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_cards')
    .select('name, position, company_name, short_intro, profile_image_url')
    .eq('slug', slug).eq('is_active', true).single()

  if (!data) return { title: '명함을 찾을 수 없습니다' }

  const title = `${data.name} - ${data.position} / ${data.company_name}`
  const desc = data.short_intro ?? `${data.position} | ${data.company_name}`

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: data.profile_image_url ? [{ url: data.profile_image_url, width: 1200, height: 630 }] : [],
      type: 'profile',
      siteName: 'CardLab',
    },
    twitter: { card: 'summary_large_image', title, description: desc, images: data.profile_image_url ? [data.profile_image_url] : [] },
  }
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: card } = await supabase
    .from('business_cards').select('*').eq('slug', slug).eq('is_active', true).single()

  if (!card) notFound()

  const props = { card }
  switch (card.template_key) {
    case 'afg-light': return <AfgLightCard {...props} />
    case 'modern-gray': return <ModernGrayCard {...props} />
    case 'navy-pro': return <NavyProCard {...props} />
    case 'clean-white': return <CleanWhiteCard {...props} />
    default: return <AfgDarkCard {...props} />
  }
}
