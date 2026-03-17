CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.business_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  english_name TEXT,
  position TEXT NOT NULL,
  company_name TEXT NOT NULL,
  team_name TEXT,
  short_intro TEXT,
  phone TEXT,
  email TEXT,
  website_url TEXT,
  instagram_url TEXT,
  kakao_url TEXT,
  inquiry_url TEXT,
  address TEXT,
  profile_image_url TEXT,
  cover_image_url TEXT,
  template_key TEXT NOT NULL DEFAULT 'authentic-finance',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.card_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON public.business_cards FOR SELECT USING (is_active = TRUE);
CREATE POLICY "admin_all" ON public.business_cards FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "public_read_links" ON public.card_links FOR SELECT USING (EXISTS (SELECT 1 FROM public.business_cards WHERE id = card_links.card_id AND is_active = TRUE));
CREATE POLICY "admin_all_links" ON public.card_links FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
