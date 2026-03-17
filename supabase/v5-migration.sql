-- v5 마이그레이션: 회사 배경 이미지 + 명함 배경 컬럼 추가
-- Supabase SQL Editor에서 실행해주세요.

-- 1. companies 테이블에 background_url 컬럼 추가
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS background_url TEXT;

-- 2. business_cards 테이블에 company_background_url 컬럼 추가
ALTER TABLE business_cards
  ADD COLUMN IF NOT EXISTS company_background_url TEXT;

-- 3. 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('companies', 'business_cards')
  AND column_name IN ('background_url', 'company_background_url');
