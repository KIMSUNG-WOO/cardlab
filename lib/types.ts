// =============================================
// 명함 관련 타입 정의
// =============================================

export type TemplateKey =
  | 'authentic-finance'
  | 'minimal-dark'
  | 'clean-corporate'
  | 'teal-premium'

export interface CardLink {
  id?: string
  label: string
  type: 'phone' | 'sms' | 'email' | 'url' | 'kakao' | 'instagram' | 'inquiry'
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
  theme_overrides?: Record<string, string> | null
  is_active: boolean
  links?: CardLink[]
  created_at: string
  updated_at: string
}

// 생성/수정 시 사용하는 타입
export type BusinessCardInput = Omit<BusinessCard, 'id' | 'created_at' | 'updated_at'>

// 관리자 폼용 타입
export interface CardFormData {
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

// =============================================
// 템플릿 관련 타입 정의
// =============================================

export interface TemplateConfig {
  key: TemplateKey
  label: string
  description: string
  // 배경
  bgPrimary: string
  bgSecondary: string
  bgCard: string
  // 텍스트
  textPrimary: string
  textSecondary: string
  textMuted: string
  // 포인트 컬러
  accentColor: string
  accentLight: string
  // 버튼
  btnPrimary: string
  btnSecondary: string
  btnText: string
  // 테두리
  borderColor: string
  // 기타
  cardRadius: string
  // 모션 스타일 키
  motionStyle: 'fade-slide' | 'zoom-fade' | 'slide-up'
}

// =============================================
// API 응답 타입
// =============================================

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}
