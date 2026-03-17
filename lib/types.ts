export type TemplateKey =
  | 'afg-dark'
  | 'afg-light'
  | 'modern-gray'
  | 'navy-pro'
  | 'clean-white'
  | 'premium-black'
  | 'slate-pro'
  | 'warm-white'

export type AnimationType =
  | 'zoom-out'      // 사진 강조 후 줌아웃 (기본)
  | 'fade-in'       // 부드러운 페이드인
  | 'slide-up'      // 슬라이드업
  | 'blur-reveal'   // 블러 해제형
  | 'cinematic'     // 프리미엄 시네마틱
  | 'minimal'       // 미니멀 모션
  | 'none'          // 애니메이션 없음

export type LinkType =
  | 'phone' | 'sms' | 'email' | 'kakao'
  | 'instagram' | 'youtube' | 'blog'
  | 'website' | 'consult' | 'naver'
  | 'extension' | 'fax' | 'custom'

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

export interface Company {
  id: string
  name: string
  logo_url?: string | null
  created_at: string
}

export interface CustomColors {
  bg: string
  hero_bg: string
  accent: string
  btn_primary: string
  text_name: string
  text_sub: string
}

export interface CardDesignOptions {
  animation_type: AnimationType
  animation_speed: 'slow' | 'normal' | 'fast'
  animation_on: boolean
  show_icon: boolean
  show_text: boolean
  icon_style: 'line' | 'fill'
  icon_size: 'sm' | 'md' | 'lg'
  font_size: 'sm' | 'md' | 'lg'
  btn_radius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  btn_size: 'sm' | 'md' | 'lg'
  custom_colors?: CustomColors | null
}

export interface BusinessCard {
  id: string
  slug: string
  name: string
  english_name?: string | null
  position: string
  company_name: string
  company_id?: string | null
  company_logo_url?: string | null
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
  design_options?: CardDesignOptions | null
  is_active: boolean
  created_at: string
  updated_at: string
  card_news?: CardNews[]
}

export const DEFAULT_DESIGN_OPTIONS: CardDesignOptions = {
  animation_type: 'zoom-out',
  animation_speed: 'normal',
  animation_on: true,
  show_icon: true,
  show_text: true,
  icon_style: 'fill',
  icon_size: 'md',
  font_size: 'md',
  btn_radius: 'lg',
  btn_size: 'md',
  custom_colors: null,
}
