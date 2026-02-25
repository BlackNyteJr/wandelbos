-- Locations table: main entity for trail stops
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  historical_info TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  order_number INTEGER NOT NULL DEFAULT 0,
  panorama_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Location images table
CREATE TABLE IF NOT EXISTS public.location_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  is_historical BOOLEAN DEFAULT false,
  year_taken TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quiz questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quiz scores table
CREATE TABLE IF NOT EXISTS public.quiz_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  age_group TEXT DEFAULT 'adult' CHECK (age_group IN ('child', 'teen', 'adult')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;

-- Public read policies (visitors can view all data)
CREATE POLICY "locations_public_read" ON public.locations FOR SELECT USING (true);
CREATE POLICY "location_images_public_read" ON public.location_images FOR SELECT USING (true);
CREATE POLICY "quiz_questions_public_read" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "quiz_scores_public_read" ON public.quiz_scores FOR SELECT USING (true);

-- Allow anyone to insert quiz scores
CREATE POLICY "quiz_scores_public_insert" ON public.quiz_scores FOR INSERT WITH CHECK (true);

-- Admin policies (authenticated users can manage all data)
CREATE POLICY "locations_admin_insert" ON public.locations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "locations_admin_update" ON public.locations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "locations_admin_delete" ON public.locations FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "location_images_admin_insert" ON public.location_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "location_images_admin_update" ON public.location_images FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "location_images_admin_delete" ON public.location_images FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "quiz_questions_admin_insert" ON public.quiz_questions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "quiz_questions_admin_update" ON public.quiz_questions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "quiz_questions_admin_delete" ON public.quiz_questions FOR DELETE USING (auth.role() = 'authenticated');
