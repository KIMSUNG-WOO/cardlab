-- 기존 테이블에 새 컬럼 추가 (이미 테이블이 있는 경우)
ALTER TABLE public.business_cards
  ADD COLUMN IF NOT EXISTS menu_insurance_claim_url TEXT,
  ADD COLUMN IF NOT EXISTS menu_check_insurance_url TEXT,
  ADD COLUMN IF NOT EXISTS menu_analysis_url TEXT,
  ADD COLUMN IF NOT EXISTS menu_consult_url TEXT;

-- Storage 버킷 (SQL로는 불가, 대시보드에서 생성)
-- Storage > New bucket > card-images > Public: ON
