
-- Add neighborhood to businesses
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS neighborhood text DEFAULT '';

-- Add owner_id to businesses (links to auth.users)
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text DEFAULT 'Sparkles',
  enabled boolean DEFAULT true,
  sort_order integer DEFAULT 0
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage categories" ON public.categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed default categories
INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
  ('Beleza', 'beleza', 'Sparkles', 1),
  ('Barbearia', 'barbearia', 'Scissors', 2),
  ('Saúde', 'saude', 'Heart', 3),
  ('Automotivo', 'automotivo', 'Car', 4),
  ('Pet', 'pet', 'PawPrint', 5);

-- Allow authenticated users to manage their own business
CREATE POLICY "Owners can update their business" ON public.businesses
  FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can insert their business" ON public.businesses
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

-- Allow authenticated users to manage services for their business
CREATE POLICY "Owners can manage services" ON public.services
  FOR ALL TO authenticated USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
  ) WITH CHECK (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
  );

-- Allow authenticated users to manage professionals for their business
CREATE POLICY "Owners can manage professionals" ON public.professionals
  FOR ALL TO authenticated USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
  ) WITH CHECK (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
  );

-- Allow authenticated users to manage availability for their business
CREATE POLICY "Owners can manage availability" ON public.availability
  FOR ALL TO authenticated USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
  ) WITH CHECK (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
  );

-- Allow authenticated users to manage professional_services for their business
CREATE POLICY "Owners can manage professional_services" ON public.professional_services
  FOR ALL TO authenticated USING (
    professional_id IN (
      SELECT p.id FROM public.professionals p
      JOIN public.businesses b ON p.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
  ) WITH CHECK (
    professional_id IN (
      SELECT p.id FROM public.professionals p
      JOIN public.businesses b ON p.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
  );

-- Allow owners to manage featured status (admin feature via authenticated)
CREATE POLICY "Authenticated can update businesses featured" ON public.businesses
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
