
-- Drop existing overly permissive policies on storage.objects for business-assets
DROP POLICY IF EXISTS "Authenticated users can upload business assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view business assets" ON storage.objects;
DROP POLICY IF EXISTS "Business owners can update assets" ON storage.objects;
DROP POLICY IF EXISTS "Business owners can delete assets" ON storage.objects;

-- SELECT: public can view files in business-assets (read-only, no listing prevention needed for public bucket)
CREATE POLICY "Anyone can view business assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'business-assets');

-- INSERT: only business owners or admins can upload, scoped to their business folder
CREATE POLICY "Business owners can upload assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-assets'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
    )
  )
);

-- UPDATE: only business owners or admins
CREATE POLICY "Business owners can update assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'business-assets'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
    )
  )
);

-- DELETE: only business owners or admins
CREATE POLICY "Business owners can delete assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-assets'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
    )
  )
);
