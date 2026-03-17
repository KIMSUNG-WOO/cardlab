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
  const desc = data.short_intro
    ? data.short_intro
    : `${data.name} | ${data.position} | ${data.company_name} | 모바일 명함 보기`
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cardlab.digital'
  const pageUrl = `${siteUrl}/${slug}`

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: pageUrl,
      siteName: 'CardLab — 디지털 명함',
      type: 'profile',
      images: data.profile_image_url
        ? [
            {
              url: data.profile_image_url,
              width: 1200,
              height: 630,
              alt: `${data.name} 프로필`,
            },
          ]
        : [],
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: data.profile_image_url ? [data.profile_image_url] : [],
    },
    alternates: { canonical: pageUrl },
  }
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: card } = await supabase
    .from('business_cards')
    .select('*, card_news(id,title,summary,image_url,link_url,category,sort_order,is_visible,created_at)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!card) notFound()

  const normalizedCard = {
    ...card,
    extra_links: card.extra_links ? (typeof card.extra_links === 'string' ? JSON.parse(card.extra_links) : card.extra_links) : [],
    card_news: (card.card_news ?? []).filter((n: any) => n.is_visible).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }

  switch (card.template_key) {
    case 'afg-light':   return <AfgLightCard card={normalizedCard} />
    case 'modern-gray': return <ModernGrayCard card={normalizedCard} />
    case 'navy-pro':    return <NavyProCard card={normalizedCard} />
    case 'clean-white': return <CleanWhiteCard card={normalizedCard} />
    default:            return <AfgDarkCard card={normalizedCard} />
  }
}
