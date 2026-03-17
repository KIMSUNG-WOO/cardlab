-- =====================================================
-- CardLab v2 업데이트 SQL
-- Supabase Dashboard > SQL Editor 에서 실행
-- =====================================================

-- 1. extra_links 컬럼 추가 (JSON 배열)
ALTER TABLE public.business_cards
  ADD COLUMN IF NOT EXISTS extra_links JSONB DEFAULT '[]'::jsonb;

-- 2. card_news 테이블 생성
CREATE TABLE IF NOT EXISTS public.card_news (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id     UUID        NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  summary     TEXT        NOT NULL DEFAULT '',
  image_url   TEXT,
  link_url    TEXT,
  category    TEXT        NOT NULL DEFAULT 'insurance',
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  is_visible  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS card_news_card_id_idx ON public.card_news (card_id);

-- card_news RLS
ALTER TABLE public.card_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_news"
  ON public.card_news FOR SELECT
  USING (
    is_visible = TRUE AND
    EXISTS (
      SELECT 1 FROM public.business_cards
      WHERE id = card_news.card_id AND is_active = TRUE
    )
  );

CREATE POLICY "admin_all_news"
  ON public.card_news FOR ALL
  TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

-- =====================================================
-- 3. Storage RLS 정책 (card-images 버킷)
-- ⭐ 이미지 업로드 RLS 오류 해결 핵심
-- =====================================================

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "public_read_storage" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete" ON storage.objects;

-- 로그인한 사용자 업로드 허용
CREATE POLICY "authenticated_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'card-images');

-- 로그인한 사용자 수정/덮어쓰기 허용
CREATE POLICY "authenticated_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'card-images');

-- 로그인한 사용자 삭제 허용
CREATE POLICY "authenticated_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'card-images');

-- 누구나 읽기 허용 (Public 버킷)
CREATE POLICY "public_read_storage"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'card-images');
