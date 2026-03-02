
-- Create businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'beleza',
  logo_url TEXT,
  cover_url TEXT,
  phone TEXT,
  address TEXT,
  city TEXT DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view businesses" ON public.businesses FOR SELECT USING (true);

-- Add business_id to existing tables
ALTER TABLE public.services ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;
ALTER TABLE public.professionals ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;
ALTER TABLE public.availability ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;
ALTER TABLE public.bookings ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_businesses_slug ON public.businesses(slug);
CREATE INDEX idx_businesses_category ON public.businesses(category);
CREATE INDEX idx_businesses_featured ON public.businesses(featured);
CREATE INDEX idx_services_business ON public.services(business_id);
CREATE INDEX idx_professionals_business ON public.professionals(business_id);

-- Seed sample businesses
INSERT INTO public.businesses (name, slug, category, description, city, featured) VALUES
  ('Salão do Zeh', 'salaodozeh', 'beleza', 'Cortes masculinos e femininos com os melhores profissionais', 'São Paulo', true),
  ('Barbearia Premium', 'barbearia-premium', 'barbearia', 'Barbearia tradicional com atendimento VIP', 'Rio de Janeiro', true),
  ('Studio Nails Art', 'studio-nails', 'beleza', 'Unhas decoradas e esmaltação em gel', 'Curitiba', false),
  ('Clínica Bem Estar', 'clinica-bem-estar', 'saude', 'Massagens terapêuticas e estéticas', 'Belo Horizonte', false),
  ('Pet Shop Amigo Fiel', 'pet-amigo-fiel', 'pet', 'Banho, tosa e veterinário para seu pet', 'São Paulo', true),
  ('Auto Center Express', 'auto-center', 'automotivo', 'Troca de óleo, alinhamento e balanceamento', 'Campinas', false);
