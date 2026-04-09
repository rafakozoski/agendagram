
-- 1. Drop overly permissive public policies on bookings
DROP POLICY IF EXISTS "Anyone can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- 2. Create security definer function: get booked times for a date (no PII exposed)
CREATE OR REPLACE FUNCTION public.get_booked_times(
  _booking_date date,
  _business_id uuid DEFAULT NULL,
  _professional_id uuid DEFAULT NULL
)
RETURNS TABLE(booking_time time without time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.booking_time
  FROM public.bookings b
  WHERE b.booking_date = _booking_date
    AND b.status <> 'cancelled'
    AND (_business_id IS NULL OR b.business_id = _business_id)
    AND (_professional_id IS NULL OR b.professional_id = _professional_id)
$$;

-- 3. Create security definer function: count monthly bookings for free plan limit
CREATE OR REPLACE FUNCTION public.count_monthly_bookings(
  _business_id uuid,
  _month_start date,
  _month_end date
)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.bookings
  WHERE business_id = _business_id
    AND booking_date >= _month_start
    AND booking_date <= _month_end
    AND status <> 'cancelled'
$$;

-- 4. Create security definer function: check if a specific slot is available
CREATE OR REPLACE FUNCTION public.is_slot_available(
  _booking_date date,
  _booking_time time,
  _professional_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE booking_date = _booking_date
      AND booking_time = _booking_time
      AND professional_id = _professional_id
      AND status <> 'cancelled'
  )
$$;

-- 5. New constrained public INSERT policy (requires client data)
CREATE POLICY "Public can create bookings with valid data"
ON public.bookings
FOR INSERT
TO public
WITH CHECK (
  client_name IS NOT NULL AND client_name <> ''
  AND client_email IS NOT NULL AND client_email <> ''
  AND client_phone IS NOT NULL AND client_phone <> ''
  AND booking_date IS NOT NULL
  AND booking_time IS NOT NULL
);
