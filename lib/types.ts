export type TemplateKey = 'authentic-finance' | 'minimal-dark'

export interface CardLink {
  id?: string
  label: string
  type: string
  url: string
  sort_order: number
  is_visible: boolean
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
  cover_image_url?: string | null
  template_key: TemplateKey
  is_active: boolean
  links?: CardLink[]
  created_at: string
  updated_at: string
}

export type CardFormData = {
  slug: string
  name: string
  english_name: string
  position: string
  company_name: string
  team_name: string
  short_intro: string
  phone: string
  email: string
  website_url: string
  instagram_url: string
  kakao_url: string
  inquiry_url: string
  address: string
  profile_image_url: string
  cover_image_url: string
  template_key: TemplateKey
  is_active: boolean
}
