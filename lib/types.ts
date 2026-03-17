export type TemplateKey =
  | 'afg-dark' | 'afg-light' | 'modern-gray' | 'navy-pro'
  | 'clean-white' | 'premium-black' | 'slate-pro' | 'warm-white'

export type AnimationType =
  | 'zoom-out'      // 줌아웃형 (기본)
  | 'fade-in'       // 페이드인형
  | 'slide-up'      // 슬라이드업형
  | 'blur-reveal'   // 블러 해제형
  | 'photo-first'   // 사진 먼저
  | 'text-first'    // 텍스트 먼저
  | 'simultaneous'  // 동시 등장
  | 'cinematic'     // 시네마틱
  | 'minimal'       // 미니멀
  | 'bounce'        // 바운스형
  | 'none'          // 없음

export type LinkType =
  | 'phone' | 'sms' | 'email' | 'kakao'
  | 'instagram' | 'youtube' | 'blog'
  | 'website' | 'consult' | 'naver'
  | 'extension' | 'fax' | 'custom'

// 각 항목 앞에 붙는 요소 타입
// 'none' = 아무것도 없음
// 'emoji' = 이모지 아이콘
// 'text' = 텍스트 라벨
// 'image' = 업로드 이미지
export type LabelPrefixType = 'none' | 'emoji' | 'text' | 'image'

export interface LinkItem {
  id: string
  type: LinkType
  label: string
  url: string
  emoji: string
  // 항목 앞 요소 설정 (기본값: 'none' — 아무것도 안 붙임)
  prefixType?: LabelPrefixType
  prefixEmoji?: string   // prefixType === 'emoji' 일 때 사용
  prefixText?: string    // prefixType === 'text' 일 때 사용
  prefixImage?: string   // prefixType === 'image' 일 때 사용할 이미지 URL
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
  background_url?: string | null   // v5: 회사 배경 이미지
  created_at: string
}

// v5: 쉬운 용어 색상 시스템
export interface CustomColors {
  page_bg: string      // 페이지 배경색
  card_bg: string      // 카드 배경색
  btn_color: string    // 버튼 색
  name_color: string   // 이름 색
  desc_color: string   // 설명 글씨 색
  accent: string       // 강조 색
}

// v5: 모든 텍스트 항목 개별 수정
export interface AllLabels {
  // 이름/직함 영역
  name_label?: string         // 이름 위에 표시할 레이블 (보통 비워둠)
  position_label?: string     // 직함 앞 레이블
  company_label?: string      // 회사명 앞 레이블

  // 연락처 항목 제목
  phone?: string              // 예: '📞', 'Mobile', 'Tel'
  email?: string              // 예: '✉️', 'Mail', 'Email'
  address?: string            // 예: '📍', 'Address', ''
  website?: string            // 예: '🌐', 'Web', ''
  extension?: string          // 예: '📟', 'Tel'
  fax?: string                // 예: '🖷', 'Fax'

  // 섹션 제목
  menu_section?: string       // MENU 섹션 제목 (기본: 'MENU')
  news_section?: string       // 카드뉴스 섹션 제목 (기본: 'CARD NEWS')

  // 버튼 텍스트
  call_btn?: string           // 전화 버튼 텍스트
  sms_btn?: string            // SMS 버튼 텍스트
}

export interface CardDesignOptions {
  animation_type: AnimationType
  animation_speed: 'slow' | 'normal' | 'fast'
  animation_delay: number       // 0~2초
  animation_on: boolean

  show_icon: boolean            // 메뉴/링크 아이콘 표시
  show_text: boolean            // 메뉴/링크 텍스트 표시
  icon_size: number             // px (기본 22)

  font_size_name: number        // 이름 px (기본 28)
  font_size_sub: number         // 직함 px (기본 14)
  font_size_body: number        // 본문 px (기본 13)

  btn_radius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  btn_size: 'sm' | 'md' | 'lg'

  // 프로필 이미지 위치 조절
  profile_position_y?: number   // 0~100 (기본 15 = 상단 15%)

  custom_colors?: CustomColors | null
  labels?: AllLabels | null     // v5: 모든 텍스트 라벨
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
  company_background_url?: string | null   // v5: 회사 배경
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
  animation_delay: 0,
  animation_on: true,
  show_icon: true,
  show_text: true,
  icon_size: 22,
  font_size_name: 28,
  font_size_sub: 14,
  font_size_body: 13,
  btn_radius: 'lg',
  btn_size: 'md',
  profile_position_y: 15,
  custom_colors: null,
  labels: null,
}

export const DEFAULT_LABELS: AllLabels = {
  phone: '',
  email: '',
  address: '',
  website: '',
  extension: '',
  fax: '',
  menu_section: 'MENU',
  news_section: 'CARD NEWS',
  call_btn: '전화 문의하기',
  sms_btn: 'SMS 문의',
}
