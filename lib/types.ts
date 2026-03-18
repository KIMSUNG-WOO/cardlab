export type TemplateKey =
  | 'afg-dark' | 'afg-light' | 'modern-gray' | 'navy-pro'
  | 'clean-white' | 'premium-black' | 'slate-pro' | 'warm-white'
  | 'card-type' | 'minimal-type' | 'premium-type' | 'text-focus'
  | 'visual-focus' | 'ceo-type' | 'consultant-type' | 'finance-expert'

export type AnimationType =
  | 'zoom-out' | 'fade-in' | 'slide-up' | 'blur-reveal'
  | 'photo-first' | 'text-first' | 'simultaneous'
  | 'cinematic' | 'bounce' | 'minimal' | 'none'

export type LinkType =
  | 'phone' | 'sms' | 'email' | 'kakao'
  | 'instagram' | 'youtube' | 'blog'
  | 'website' | 'consult' | 'naver'
  | 'extension' | 'fax' | 'custom'

export type LabelPrefixType = 'none' | 'emoji' | 'text' | 'image'

export type DesignStyle = 'card' | 'minimal' | 'premium' | 'text-focus' | 'visual-focus'
export type FontStyle = 'default' | 'serif' | 'bold' | 'light'
export type BgStyle = 'solid' | 'gradient' | 'blur' | 'image-blend'
export type InfoLayout = 'standard' | 'compact' | 'expanded'

export interface LinkItem {
  id: string
  type: LinkType
  label: string
  url: string
  emoji: string
  prefixType?: LabelPrefixType
  prefixEmoji?: string
  prefixText?: string
  prefixImage?: string
}

export interface CardNews {
  id: string; card_id: string; title: string; summary: string
  image_url?: string | null; link_url?: string | null
  category: 'insurance' | 'finance' | 'policy' | 'news' | 'notice'
  sort_order: number; is_visible: boolean; created_at: string
}

export interface Company {
  id: string; name: string
  logo_url?: string | null
  background_url?: string | null
  created_at: string
}

export interface CustomColors {
  page_bg: string; card_bg: string; btn_color: string
  name_color: string; desc_color: string; accent: string
  team_badge_bg?: string
  team_badge_text?: string
}

export type LabelMode = 'emoji' | 'image' | 'text' | 'none'

export interface LabelConfig {
  mode: LabelMode
  emoji?: string
  imageUrl?: string
  text?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
  fontFamily?: 'pretendard' | 'serif' | 'mono'
}

export interface AllLabels {
  phone_cfg?: LabelConfig
  email_cfg?: LabelConfig
  address_cfg?: LabelConfig
  website_cfg?: LabelConfig
  extension_cfg?: LabelConfig
  fax_cfg?: LabelConfig
  phone?: string
  email?: string
  address?: string
  website?: string
  extension?: string
  fax?: string
  menu_section?: string
  news_section?: string
  call_btn?: string
  sms_btn?: string
  kakao_btn?: string
  consult_btn?: string
  email_btn?: string
  menu_insurance?: string
  menu_check?: string
  menu_analysis?: string
  menu_consult?: string
}

export interface CardDesignOptions {
  animation_type: AnimationType
  animation_speed: 'slow' | 'normal' | 'fast'
  animation_delay: number
  animation_on: boolean
  show_icon: boolean
  show_text: boolean
  icon_size: number
  font_size_name: number
  font_size_sub: number
  font_size_body: number
  font_size_team: number
  logo_height: number
  btn_radius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  btn_size: 'sm' | 'md' | 'lg'
  profile_position_y?: number
  profile_position_x?: number
  profile_zoom?: number
  custom_colors?: CustomColors | null
  labels?: AllLabels | null
  design_style?: DesignStyle
  font_style?: FontStyle
  bg_style?: BgStyle
  info_layout?: InfoLayout
}

export interface BusinessCard {
  id: string; slug: string; name: string
  english_name?: string | null; position: string
  company_name: string; company_id?: string | null
  company_logo_url?: string | null
  company_background_url?: string | null
  team_name?: string | null; short_intro?: string | null
  phone?: string | null; email?: string | null
  website_url?: string | null; instagram_url?: string | null
  kakao_url?: string | null; inquiry_url?: string | null
  address?: string | null; profile_image_url?: string | null
  menu_insurance_claim_url?: string | null
  menu_check_insurance_url?: string | null
  menu_analysis_url?: string | null
  menu_consult_url?: string | null
  extra_links?: LinkItem[] | null
  template_key: TemplateKey
  design_options?: CardDesignOptions | null
  is_active: boolean
  created_at: string; updated_at: string
  card_news?: CardNews[]
}

export const DEFAULT_DESIGN_OPTIONS: CardDesignOptions = {
  animation_type: 'zoom-out', animation_speed: 'normal',
  animation_delay: 0, animation_on: true,
  show_icon: true, show_text: true,
  icon_size: 22,
  font_size_name: 28, font_size_sub: 14,
  font_size_body: 13, font_size_team: 11,
  logo_height: 26,
  btn_radius: 'lg', btn_size: 'md',
  profile_position_y: 15,
  custom_colors: null, labels: null,
  profile_position_x: 50,
  profile_zoom: 100,
  design_style: 'card',
  font_style: 'default',
  bg_style: 'solid',
  info_layout: 'standard',
}

export const DEFAULT_LABELS: AllLabels = {
  phone: '', email: '', address: '', website: '',
  extension: '', fax: '',
  menu_section: 'MENU', news_section: 'CARD NEWS',
  call_btn: '전화 문의하기', sms_btn: 'SMS 문의',
  kakao_btn: '카카오 채널', consult_btn: '상담 예약',
  email_btn: '이메일 문의',
  menu_insurance: '보험금청구', menu_check: '내보험조회',
  menu_analysis: '보장분석', menu_consult: '상담신청',
}

export const DEFAULT_LABEL_EMOJIS: { key: string; label: string; emoji: string }[] = [
  { key: 'phone',   label: '전화',     emoji: '📞' },
  { key: 'phone2',  label: '모바일',   emoji: '📱' },
  { key: 'email',   label: '이메일',   emoji: '✉️' },
  { key: 'address', label: '주소',     emoji: '📍' },
  { key: 'website', label: '웹사이트', emoji: '🌐' },
  { key: 'fax',     label: '팩스',     emoji: '🖷' },
  { key: 'ext',     label: '내선',     emoji: '📟' },
  { key: 'dot',     label: '점',       emoji: '•' },
  { key: 'none',    label: '없음',     emoji: '' },
]

export interface ColorSuggestion {
  label: string
  colors: { name: string; value: string }[]
}

export const COLOR_COMBOS: Record<string, ColorSuggestion> = {
  dark: {
    label: '다크 계열 (검정/네이비)',
    colors: [
      { name: '카드 배경', value: '#0d1a2d' },
      { name: '버튼색',   value: '#1e40af' },
      { name: '이름색',   value: '#f0f4ff' },
      { name: '설명색',   value: '#8fafc8' },
      { name: '강조색',   value: '#3b82f6' },
    ],
  },
  light: {
    label: '라이트 계열 (흰색/크림)',
    colors: [
      { name: '카드 배경', value: '#ffffff' },
      { name: '버튼색',   value: '#1e40af' },
      { name: '이름색',   value: '#1a1a1a' },
      { name: '설명색',   value: '#555555' },
      { name: '강조색',   value: '#2563eb' },
    ],
  },
  navy: {
    label: '네이비 프리미엄',
    colors: [
      { name: '카드 배경', value: '#0f2040' },
      { name: '버튼색',   value: '#4a9eff' },
      { name: '이름색',   value: '#e8f0ff' },
      { name: '설명색',   value: '#7fa8cc' },
      { name: '강조색',   value: '#60a5fa' },
    ],
  },
  charcoal: {
    label: '차콜 모던',
    colors: [
      { name: '카드 배경', value: '#1e293b' },
      { name: '버튼색',   value: '#0ea5e9' },
      { name: '이름색',   value: '#f1f5f9' },
      { name: '설명색',   value: '#94a3b8' },
      { name: '강조색',   value: '#38bdf8' },
    ],
  },
  gold: {
    label: '블랙 골드 고급',
    colors: [
      { name: '카드 배경', value: '#111111' },
      { name: '버튼색',   value: '#b8860b' },
      { name: '이름색',   value: '#ffd700' },
      { name: '설명색',   value: '#c8a96e' },
      { name: '강조색',   value: '#d4af37' },
    ],
  },
  warm: {
    label: '웜톤 크림',
    colors: [
      { name: '카드 배경', value: '#faf9f7' },
      { name: '버튼색',   value: '#92400e' },
      { name: '이름색',   value: '#1c1917' },
      { name: '설명색',   value: '#78716c' },
      { name: '강조색',   value: '#d97706' },
    ],
  },
}
