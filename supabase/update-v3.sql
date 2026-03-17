-- =====================================================
-- CardLab v3 업데이트 SQL
-- Supabase Dashboard > SQL Editor 에서 실행
-- =====================================================

-- 1. business_cards 새 컬럼 추가
ALTER TABLE public.business_cards
  ADD COLUMN IF NOT EXISTS company_id        UUID,
  ADD COLUMN IF NOT EXISTS company_logo_url  TEXT,
  ADD COLUMN IF NOT EXISTS design_options    JSONB DEFAULT '{}'::jsonb;

-- 2. companies 테이블 생성
CREATE TABLE IF NOT EXISTS public.companies (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name       TEXT        NOT NULL,
  logo_url   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- companies RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "public_read_companies"
  ON public.companies FOR SELECT TO public USING (TRUE);

CREATE POLICY IF NOT EXISTS "admin_all_companies"
  ON public.companies FOR ALL TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

-- 3. business_cards FK (선택사항)
ALTER TABLE public.business_cards
  ADD CONSTRAINT IF NOT EXISTS business_cards_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;

-- =====================================================
-- 4. Storage RLS 재확인 (이미지 업로드 오류 방지)
-- =====================================================
-- 아래 정책이 없으면 업로드 시 RLS 오류 발생

DO $$
BEGIN
  -- INSERT 정책
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='authenticated_can_upload'
  ) THEN
    EXECUTE 'CREATE POLICY "authenticated_can_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''card-images'')';
  END IF;

  -- UPDATE 정책
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='authenticated_can_update'
  ) THEN
    EXECUTE 'CREATE POLICY "authenticated_can_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = ''card-images'')';
  END IF;

  -- DELETE 정책
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='authenticated_can_delete'
  ) THEN
    EXECUTE 'CREATE POLICY "authenticated_can_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''card-images'')';
  END IF;

  -- SELECT 정책
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='public_can_read'
  ) THEN
    EXECUTE 'CREATE POLICY "public_can_read" ON storage.objects FOR SELECT TO public USING (bucket_id = ''card-images'')';
  END IF;
END $$;

-- =====================================================
-- 5. 기존 잘못된 template_key 정규화
-- =====================================================
UPDATE public.business_cards
SET template_key = 'afg-dark'
WHERE template_key NOT IN (
  'afg-dark','afg-light','modern-gray','navy-pro',
  'clean-white','premium-black','slate-pro','warm-white'
);

-- 결과 확인
SELECT slug, name, template_key FROM public.business_cards ORDER BY created_at DESC;
