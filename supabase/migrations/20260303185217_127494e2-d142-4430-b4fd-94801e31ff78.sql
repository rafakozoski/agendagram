
-- Fix ALL RLS policies: change from RESTRICTIVE to PERMISSIVE

-- ========== SERVICES ==========
DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
DROP POLICY IF EXISTS "Owners can manage services" ON public.services;

CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Owners can manage services" ON public.services FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- ========== PROFESSIONALS ==========
DROP POLICY IF EXISTS "Anyone can view professionals" ON public.professionals;
DROP POLICY IF EXISTS "Owners can manage professionals" ON public.professionals;

CREATE POLICY "Anyone can view professionals" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "Owners can manage professionals" ON public.professionals FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- ========== AVAILABILITY ==========
DROP POLICY IF EXISTS "Anyone can view availability" ON public.availability;
DROP POLICY IF EXISTS "Owners can manage availability" ON public.availability;

CREATE POLICY "Anyone can view availability" ON public.availability FOR SELECT USING (true);
CREATE POLICY "Owners can manage availability" ON public.availability FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- ========== BOOKINGS ==========
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can view bookings" ON public.bookings;

CREATE POLICY "Anyone can view bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can update bookings" ON public.bookings FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Admins can update bookings" ON public.bookings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ========== BUSINESSES ==========
DROP POLICY IF EXISTS "Anyone can view businesses" ON public.businesses;
DROP POLICY IF EXISTS "Owners can insert their business" ON public.businesses;
DROP POLICY IF EXISTS "Owners can update their business" ON public.businesses;
DROP POLICY IF EXISTS "Admins can update any business" ON public.businesses;

CREATE POLICY "Anyone can view businesses" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Owners can insert their business" ON public.businesses FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update their business" ON public.businesses FOR UPDATE
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Admins can update any business" ON public.businesses FOR UPDATE
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ========== CATEGORIES ==========
DROP POLICY IF EXISTS "Anyone can view enabled categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ========== PROFESSIONAL_SERVICES ==========
DROP POLICY IF EXISTS "Anyone can view professional_services" ON public.professional_services;
DROP POLICY IF EXISTS "Owners can manage professional_services" ON public.professional_services;

CREATE POLICY "Anyone can view professional_services" ON public.professional_services FOR SELECT USING (true);
CREATE POLICY "Owners can manage professional_services" ON public.professional_services FOR ALL
  USING (professional_id IN (SELECT p.id FROM professionals p JOIN businesses b ON p.business_id = b.id WHERE b.owner_id = auth.uid()))
  WITH CHECK (professional_id IN (SELECT p.id FROM professionals p JOIN businesses b ON p.business_id = b.id WHERE b.owner_id = auth.uid()));

-- ========== USER_ROLES ==========
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
