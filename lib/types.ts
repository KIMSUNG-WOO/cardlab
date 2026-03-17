export type TemplateKey = 'afg-dark' | 'afg-light' | 'modern-gray' | 'navy-pro' | 'clean-white'

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
  // 메뉴 항목 URL
  menu_insurance_claim_url?: string | null
  menu_check_insurance_url?: string | null
  menu_analysis_url?: string | null
  menu_consult_url?: string | null
  // 템플릿
  template_key: TemplateKey
  template_color?: string | null  // 색상 커스터마이징
  is_active: boolean
  created_at: string
  updated_at: string
}

export type CardFormData = Omit<BusinessCard, 'id' | 'created_at' | 'updated_at'>
