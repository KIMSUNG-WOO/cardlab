import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AfgDarkCard } from '@/components/templates/afg-dark-card'
import { AfgLightCard } from '@/components/templates/afg-light-card'
import { ModernGrayCard } from '@/components/templates/modern-gray-card'
import { NavyProCard } from '@/components/templates/navy-pro-card'
import { CleanWhiteCard } from '@/components/templates/clean-white-card'
import { PremiumBlackCard } from '@/components/templates/premium-black-card'
import { SlateProCard } from '@/components/templates/slate-pro-card'
import { WarmWhiteCard } from '@/components/templates/warm-white-card'
import type { BusinessCard } from '@/lib/types'
import { DEFAULT_DESIGN_OPTIONS } from '@/lib/types'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_cards')
    .select('name, position, company_name, short_intro, profile_image_url')
    .eq('slug', slug).eq('is_active', true).single()

  if (!data) return { title: '명함을 찾을 수 없습니다' }

  const name     = data.name
  const position = data.position
  const company  = data.company_name
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cardlab.digital'
  const pageUrl  = siteUrl + '/' + slug
  const ogTitle  = name + ' | ' + position
  const shortDesc = data.short_intro ? data.short_intro.slice(0, 60) : position + ' · ' + company
  const ogDesc   = company + '\n' + shortDesc + '\n\n📱 모바일 명함 보기'

  return {
    title: name + ' - ' + position + ' / ' + company,
    description: ogDesc,
    icons: {
      icon: '/icons/favicon.svg',
      apple: '/icons/favicon.svg',
      shortcut: '/icons/favicon.svg',
    },
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      url: pageUrl,
      siteName: 'CardLab 디지털 명함',
      type: 'profile',
      locale: 'ko_KR',
      images: data.profile_image_url
        ? [{ url: data.profile_image_url, width: 800, height: 800, alt: name + ' 프로필' }]
        : [{ url: siteUrl + '/og-default.png', width: 1200, height: 630, alt: 'CardLab 디지털 명함' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: company + ' · ' + shortDesc,
      images: data.profile_image_url ? [data.profile_image_url] : [],
    },
    alternates: { canonical: pageUrl },
    other: {
      'og:image:secure_url': data.profile_image_url ?? '',
    },
  }
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: card } = await supabase
    .from('business_cards')
    .select('*, company_background_url, card_news(id,title,summary,image_url,link_url,category,sort_order,is_visible,created_at)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!card) notFound()

  const rawDesign = card.design_options
    ? (typeof card.design_options === 'string' ? JSON.parse(card.design_options) : card.design_options)
    : {}

  const normalizedCard: BusinessCard = {
    ...card,
    extra_links: card.extra_links
      ? (typeof card.extra_links === 'string' ? JSON.parse(card.extra_links) : card.extra_links)
      : [],
    design_options: { ...DEFAULT_DESIGN_OPTIONS, ...rawDesign },
    card_news: (card.card_news ?? [])
      .filter((n: any) => n.is_visible)
      .sort((a: any, b: any) => a.sort_order - b.sort_order),
  }

  switch (card.template_key) {
    case 'afg-light':      return <AfgLightCard card={normalizedCard} />
    case 'modern-gray':    return <ModernGrayCard card={normalizedCard} />
    case 'navy-pro':       return <NavyProCard card={normalizedCard} />
    case 'clean-white':    return <CleanWhiteCard card={normalizedCard} />
    case 'premium-black':  return <PremiumBlackCard card={normalizedCard} />
    case 'slate-pro':      return <SlateProCard card={normalizedCard} />
    case 'warm-white':     return <WarmWhiteCard card={normalizedCard} />
    default:               return <AfgDarkCard card={normalizedCard} />
  }
}
