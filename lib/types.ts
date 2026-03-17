export type TemplateKey = 'afg-dark' | 'afg-light' | 'modern-gray' | 'navy-pro' | 'clean-white'

export type LinkType =
  | 'phone' | 'sms' | 'email' | 'kakao'
  | 'instagram' | 'youtube' | 'blog'
  | 'website' | 'consult' | 'custom'

export interface LinkItem {
  id: string
  type: LinkType
  label: string
  url: string
  emoji: string
}

export interface CardNews {
  id: string
  card_id: string
  title: string
  summary: string
  image_url?: string | null
  link_url?: string | null
  category: 'insurance' | 'finance' | 'policy' | 'news' | 'notice'
  sort_order: number
  is_visible: boolean
  created_at: string
}

export interface BusinessCard {
  id: string
  slug: string
  name: string
  english_name?: string | null
  position: string
  company_name: string
  team_name?: string | null
  short_intro?: string | null
  phone?: string | null
  email?: string | null
  website_url?: string | null
  instagram_url?: string | null
  kakao_url?: string | null
  inquiry_url?: string | null
  address?: string | null
  profile_image_url?: string | null
  menu_insurance_claim_url?: string | null
  menu_check_insurance_url?: string | null
  menu_analysis_url?: string | null
  menu_consult_url?: string | null
  extra_links?: LinkItem[] | null
  template_key: TemplateKey
  is_active: boolean
  created_at: string
  updated_at: string
  card_news?: CardNews[]
}

export type CardFormData = Omit<BusinessCard, 'id' | 'created_at' | 'updated_at' | 'card_news'>
