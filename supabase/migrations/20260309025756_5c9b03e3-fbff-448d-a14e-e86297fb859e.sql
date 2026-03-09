
-- Fix ALL restrictive RLS policies across all tables to PERMISSIVE

-- ===== availability =====
DROP POLICY IF EXISTS "Anyone can view availability" ON public.availability;
DROP POLICY IF EXISTS "Owners can manage availability" ON public.availability;
DROP POLICY IF EXISTS "Admins can manage availability" ON public.availability;

CREATE POLICY "Anyone can view availability" ON public.availability FOR SELECT USING (true);
CREATE POLICY "Owners can manage availability" ON public.availability FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Admins can manage availability" ON public.availability FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===== bookings =====
DROP POLICY IF EXISTS "Anyone can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;
DROP POLICY IF EXISTS "Owners can delete bookings" ON public.bookings;
DROP POLICY IF EXISTS "Owners can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;

CREATE POLICY "Anyone can view bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can manage bookings" ON public.bookings FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Admins can manage bookings" ON public.bookings FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===== businesses =====
DROP POLICY IF EXISTS "Anyone can view businesses" ON public.businesses;
DROP POLICY IF EXISTS "Owners can insert their business" ON public.businesses;
DROP POLICY IF EXISTS "Owners can update their business" ON public.businesses;
DROP POLICY IF EXISTS "Admins can update any business" ON public.businesses;
DROP POLICY IF EXISTS "Admins can insert businesses" ON public.businesses;
DROP POLICY IF EXISTS "Admins can delete businesses" ON public.businesses;

CREATE POLICY "Anyone can view businesses" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Owners can insert their business" ON public.businesses FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update their business" ON public.businesses FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Admins can manage businesses" ON public.businesses FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===== categories =====
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===== professional_services =====
DROP POLICY IF EXISTS "Anyone can view professional_services" ON public.professional_services;
DROP POLICY IF EXISTS "Owners can manage professional_services" ON public.professional_services;
DROP POLICY IF EXISTS "Admins can manage professional_services" ON public.professional_services;

CREATE POLICY "Anyone can view professional_services" ON public.professional_services FOR SELECT USING (true);
CREATE POLICY "Owners can manage professional_services" ON public.professional_services FOR ALL TO authenticated
  USING (professional_id IN (SELECT p.id FROM professionals p JOIN businesses b ON p.business_id = b.id WHERE b.owner_id = auth.uid()))
  WITH CHECK (professional_id IN (SELECT p.id FROM professionals p JOIN businesses b ON p.business_id = b.id WHERE b.owner_id = auth.uid()));
CREATE POLICY "Admins can manage professional_services" ON public.professional_services FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===== professionals =====
DROP POLICY IF EXISTS "Anyone can view professionals" ON public.professionals;
DROP POLICY IF EXISTS "Owners can manage professionals" ON public.professionals;
DROP POLICY IF EXISTS "Admins can manage professionals" ON public.professionals;

CREATE POLICY "Anyone can view professionals" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "Owners can manage professionals" ON public.professionals FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Admins can manage professionals" ON public.professionals FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===== service_catalog =====
DROP POLICY IF EXISTS "Anyone can view service_catalog" ON public.service_catalog;
DROP POLICY IF EXISTS "Admins can manage service_catalog" ON public.service_catalog;

CREATE POLICY "Anyone can view service_catalog" ON public.service_catalog FOR SELECT USING (true);
CREATE POLICY "Admins can manage service_catalog" ON public.service_catalog FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===== services =====
DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
DROP POLICY IF EXISTS "Owners can manage services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;

CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Owners can manage services" ON public.services FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Admins can manage services" ON public.services FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
