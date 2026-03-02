
-- Services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'service' CHECK (type IN ('service', 'product')),
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 30,
  description TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Professionals table
CREATE TABLE public.professionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Junction: professional <-> service
CREATE TABLE public.professional_services (
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (professional_id, service_id)
);

-- Availability table
CREATE TABLE public.availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL DEFAULT '09:00',
  end_time TIME NOT NULL DEFAULT '18:00',
  enabled BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (day_of_week)
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- All tables are public-facing (no auth required for booking)
-- RLS enabled but with permissive policies for this SaaS MVP

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Public read for services, professionals, availability
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Anyone can view professionals" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "Anyone can view professional_services" ON public.professional_services FOR SELECT USING (true);
CREATE POLICY "Anyone can view availability" ON public.availability FOR SELECT USING (true);

-- Anyone can create bookings (public booking form)
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view bookings" ON public.bookings FOR SELECT USING (true);

-- Seed default availability
INSERT INTO public.availability (day_of_week, start_time, end_time, enabled) VALUES
  (0, '09:00', '13:00', false),
  (1, '09:00', '18:00', true),
  (2, '09:00', '18:00', true),
  (3, '09:00', '18:00', true),
  (4, '09:00', '18:00', true),
  (5, '09:00', '18:00', true),
  (6, '09:00', '13:00', true);

-- Seed services
INSERT INTO public.services (name, type, price, duration, description) VALUES
  ('Corte de Cabelo', 'service', 50, 30, 'Corte masculino ou feminino'),
  ('Coloração', 'service', 120, 60, 'Tintura completa'),
  ('Manicure', 'service', 35, 45, 'Unhas das mãos'),
  ('Kit Tratamento Capilar', 'product', 89.90, 0, 'Shampoo + Condicionador + Máscara');

-- Seed professionals
INSERT INTO public.professionals (name, role) VALUES
  ('Ana Silva', 'Cabeleireira'),
  ('Carlos Santos', 'Barbeiro'),
  ('Maria Oliveira', 'Manicure');
