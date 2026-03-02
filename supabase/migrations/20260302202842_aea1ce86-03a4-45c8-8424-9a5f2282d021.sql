
-- Allow updating bookings (for admin status changes)
CREATE POLICY "Anyone can update bookings" ON public.bookings FOR UPDATE USING (true) WITH CHECK (true);
