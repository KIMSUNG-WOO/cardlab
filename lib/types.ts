export type TemplateKey =
  | 'afg-dark' | 'afg-light' | 'modern-gray' | 'navy-pro'
  | 'clean-white' | 'premium-black' | 'slate-pro' | 'warm-white'

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
}

// 라벨 앞에 붙는 요소 설정 (이모지/이미지/텍스트 선택)
export type LabelMode = 'emoji' | 'image' | 'text' | 'none'

export interface LabelConfig {
  mode: LabelMode
  emoji?: string       // mode === 'emoji'
  imageUrl?: string    // mode === 'image'
  text?: string        // mode === 'text'
  // 폰트 설정 (mode === 'text' 일 때)
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
  fontFamily?: 'pretendard' | 'serif' | 'mono'
}

// 모든 텍스트/라벨 설정 v6
export interface AllLabels {
  // 연락처 항목 라벨 (이모지/이미지/텍스트 선택 가능)
  phone_cfg?: LabelConfig
  email_cfg?: LabelConfig
  address_cfg?: LabelConfig
  website_cfg?: LabelConfig
  extension_cfg?: LabelConfig
  fax_cfg?: LabelConfig

  // 기존 호환용
  phone?: string
  email?: string
  address?: string
  website?: string
  extension?: string
  fax?: string

  // 섹션 제목
  menu_section?: string
  news_section?: string

  // 버튼 텍스트 전체
  call_btn?: string          // 전화 버튼
  sms_btn?: string           // SMS 버튼
  kakao_btn?: string         // 카카오 버튼
  consult_btn?: string       // 상담 예약 버튼
  email_btn?: string         // 이메일 버튼

  // 메뉴 항목 이름
  menu_insurance?: string    // 보험금청구
  menu_check?: string        // 내보험조회
  menu_analysis?: string     // 보장분석
  menu_consult?: string      // 상담신청
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
  font_size_team: number     // v6: 팀명 폰트 크기

  btn_radius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  btn_size: 'sm' | 'md' | 'lg'

  profile_position_y?: number

  custom_colors?: CustomColors | null
  labels?: AllLabels | null
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
  show_icon: true, show_text: true, icon_size: 22,
  font_size_name: 28, font_size_sub: 14,
  font_size_body: 13, font_size_team: 11,
  btn_radius: 'lg', btn_size: 'md',
  profile_position_y: 15,
  custom_colors: null, labels: null,
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

// 기본 이모지 라벨 목록
export const DEFAULT_LABEL_EMOJIS: { key: string; label: string; emoji: string }[] = [
  { key: 'phone',   label: '전화',   emoji: '📞' },
  { key: 'phone2',  label: '모바일', emoji: '📱' },
  { key: 'email',   label: '이메일', emoji: '✉️' },
  { key: 'address', label: '주소',   emoji: '📍' },
  { key: 'website', label: '웹사이트', emoji: '🌐' },
  { key: 'fax',     label: '팩스',   emoji: '🖷' },
  { key: 'ext',     label: '내선',   emoji: '📟' },
  { key: 'dot',     label: '점',     emoji: '•' },
  { key: 'none',    label: '없음',   emoji: '' },
]
