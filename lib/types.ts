export type TemplateKey =
  | 'afg-dark' | 'afg-light' | 'modern-gray' | 'navy-pro'
  | 'clean-white' | 'premium-black' | 'slate-pro' | 'warm-white'

export type AnimationType =
  | 'zoom-out' | 'fade-in' | 'slide-up' | 'blur-reveal'
  | 'photo-first' | 'text-first' | 'simultaneous'
  | 'cinematic' | 'minimal' | 'none'

export type LinkType =
  | 'phone' | 'sms' | 'email' | 'kakao'
  | 'instagram' | 'youtube' | 'blog'
  | 'website' | 'consult' | 'naver'
  | 'extension' | 'fax' | 'custom'

export interface LinkItem { id: string; type: LinkType; label: string; url: string; emoji: string }

export interface CardNews {
  id: string; card_id: string; title: string; summary: string
  image_url?: string | null; link_url?: string | null
  category: 'insurance' | 'finance' | 'policy' | 'news' | 'notice'
  sort_order: number; is_visible: boolean; created_at: string
}

export interface Company { id: string; name: string; logo_url?: string | null; created_at: string }

export interface CustomColors {
  page_bg: string; card_bg: string; btn_color: string
  name_color: string; desc_color: string; accent: string
}

export interface ContactLabels {
  phone?: string; email?: string; extension?: string
  fax?: string; address?: string; website?: string
}

export interface CardDesignOptions {
  animation_type: AnimationType
  animation_speed: 'slow' | 'normal' | 'fast'
  animation_delay: number
  animation_on: boolean
  show_icon: boolean; show_text: boolean
  icon_size: number
  font_size_name: number; font_size_sub: number; font_size_body: number
  btn_radius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  btn_size: 'sm' | 'md' | 'lg'
  custom_colors?: CustomColors | null
  contact_labels?: ContactLabels | null
}

export interface BusinessCard {
  id: string; slug: string; name: string
  english_name?: string | null; position: string
  company_name: string; company_id?: string | null; company_logo_url?: string | null
  team_name?: string | null; short_intro?: string | null
  phone?: string | null; email?: string | null
  website_url?: string | null; instagram_url?: string | null
  kakao_url?: string | null; inquiry_url?: string | null
  address?: string | null; profile_image_url?: string | null
  menu_insurance_claim_url?: string | null; menu_check_insurance_url?: string | null
  menu_analysis_url?: string | null; menu_consult_url?: string | null
  extra_links?: LinkItem[] | null; template_key: TemplateKey
  design_options?: CardDesignOptions | null; is_active: boolean
  created_at: string; updated_at: string; card_news?: CardNews[]
}

export const DEFAULT_DESIGN_OPTIONS: CardDesignOptions = {
  animation_type: 'zoom-out', animation_speed: 'normal', animation_delay: 0, animation_on: true,
  show_icon: true, show_text: true,
  icon_size: 22, font_size_name: 28, font_size_sub: 14, font_size_body: 13,
  btn_radius: 'lg', btn_size: 'md',
  custom_colors: null, contact_labels: null,
}
