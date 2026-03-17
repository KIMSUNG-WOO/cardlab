import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { BusinessCard } from '@/lib/types'
import { AuthenticFinanceCard } from '@/components/templates/authentic-finance-card'
import { MinimalDarkCard } from '@/components/templates/minimal-dark-card'

interface PageProps {
  params: Promise<{ slug: string }>
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: card } = await supabase
    .from('business_cards')
    .select('name, position, company_name, short_intro, profile_image_url')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!card) {
    return { title: '명함을 찾을 수 없습니다' }
  }

  const title = `${card.name} — ${card.position}`
  const description =
    card.short_intro ?? `${card.company_name} ${card.position} ${card.name}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: card.profile_image_url
        ? [{ url: card.profile_image_url, width: 1200, height: 630 }]
        : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: card.profile_image_url ? [card.profile_image_url] : [],
    },
  }
}

export default async function SlugPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // 명함 + 링크 조회
  const { data: card } = await supabase
    .from('business_cards')
    .select(`
      *,
      card_links (
        id,
        label,
        type,
        url,
        sort_order,
        is_visible
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!card) {
    notFound()
  }

  // card_links → links 로 정규화
  const normalizedCard: BusinessCard = {
    ...card,
    links: (card.card_links ?? [])
      .filter((l: BusinessCard['links'] extends (infer U)[] | undefined ? U : never) => l && (l as {is_visible?: boolean}).is_visible !== false)
      .sort((a: {sort_order: number}, b: {sort_order: number}) => a.sort_order - b.sort_order),
  }

  // 템플릿 라우팅
  switch (normalizedCard.template_key) {
    case 'authentic-finance':
      return <AuthenticFinanceCard card={normalizedCard} />
    case 'minimal-dark':
      return <MinimalDarkCard card={normalizedCard} />
    // 추가 템플릿은 여기에 case 추가
    default:
      return <AuthenticFinanceCard card={normalizedCard} />
  }
}
