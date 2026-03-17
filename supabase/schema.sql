-- =============================================
-- CardLab — Supabase 전체 스키마
-- =============================================
-- Supabase Dashboard > SQL Editor 에서 실행

-- UUID 확장 활성화 (이미 활성화된 경우 무시됨)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- 1. business_cards 테이블
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.business_cards (
  id                UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug              TEXT        NOT NULL UNIQUE,
  name              TEXT        NOT NULL,
  english_name      TEXT,
  position          TEXT        NOT NULL,
  company_name      TEXT        NOT NULL,
  team_name         TEXT,
  short_intro       TEXT,
  phone             TEXT,
  email             TEXT,
  website_url       TEXT,
  instagram_url     TEXT,
  kakao_url         TEXT,
  inquiry_url       TEXT,
  address           TEXT,
  profile_image_url TEXT,
  cover_image_url   TEXT,
  template_key      TEXT        NOT NULL DEFAULT 'authentic-finance',
  theme_overrides   JSONB,
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- slug 인덱스
CREATE INDEX IF NOT EXISTS business_cards_slug_idx ON public.business_cards (slug);
-- 활성 명함 인덱스
CREATE INDEX IF NOT EXISTS business_cards_active_idx ON public.business_cards (is_active);

-- ─────────────────────────────────────────────
-- 2. card_links 테이블 (확장 링크 배열)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.card_links (
  id           UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id      UUID    NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
  label        TEXT    NOT NULL,
  type         TEXT    NOT NULL, -- 'phone' | 'sms' | 'email' | 'url' | 'kakao' | 'instagram' | 'inquiry'
  url          TEXT    NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_visible   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS card_links_card_id_idx ON public.card_links (card_id);

-- ─────────────────────────────────────────────
-- 3. updated_at 자동 갱신 트리거
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.business_cards;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.business_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─────────────────────────────────────────────
-- 4. Row Level Security (RLS) 설정
-- ─────────────────────────────────────────────

-- business_cards RLS 활성화
ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY;

-- 공개 읽기: 활성화된 명함은 누구나 읽기 가능
CREATE POLICY "public_read_active_cards"
  ON public.business_cards
  FOR SELECT
  USING (is_active = TRUE);

-- 인증된 사용자(관리자)는 전체 CRUD 가능
CREATE POLICY "admin_full_access"
  ON public.business_cards
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- card_links RLS 활성화
ALTER TABLE public.card_links ENABLE ROW LEVEL SECURITY;

-- card_links: 활성 명함의 링크는 공개
CREATE POLICY "public_read_active_links"
  ON public.card_links
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_cards
      WHERE id = card_links.card_id AND is_active = TRUE
    )
  );

-- card_links: 관리자 전체 접근
CREATE POLICY "admin_full_access_links"
  ON public.card_links
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ─────────────────────────────────────────────
-- 5. Storage 버킷 생성 (SQL에서 생성 불가 — 대시보드에서 수동으로)
-- ─────────────────────────────────────────────
-- Supabase Dashboard > Storage > New Bucket
-- 버킷명: card-images
-- Public: true (공개 접근 허용)

-- ─────────────────────────────────────────────
-- 6. 샘플 데이터 (AFG 테스트용)
-- ─────────────────────────────────────────────
INSERT INTO public.business_cards (
  slug,
  name,
  english_name,
  position,
  company_name,
  team_name,
  short_intro,
  phone,
  email,
  website_url,
  instagram_url,
  address,
  template_key,
  is_active
) VALUES (
  'sample-afg',
  '홍길동',
  'Authentic Planner',
  '재무설계사',
  '어센틱금융그룹',
  'WITH Branch',
  '고객과의 소통, 그게 우선입니다.',
  '010-1234-5678',
  'hong@afg.kr',
  'https://www.afg.kr',
  'https://www.instagram.com/sample',
  '인천광역시 남동구 인주대로593 6층 어센틱금융그룹',
  'authentic-finance',
  TRUE
) ON CONFLICT (slug) DO NOTHING;
