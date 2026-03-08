
-- Add state column to businesses table
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS state text DEFAULT '';

-- Create storage bucket for business assets
INSERT INTO storage.buckets (id, name, public) VALUES ('business-assets', 'business-assets', true) ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read from the bucket
CREATE POLICY "Anyone can view business assets" ON storage.objects FOR SELECT USING (bucket_id = 'business-assets');

-- Allow authenticated users to upload to the bucket
CREATE POLICY "Authenticated users can upload business assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'business-assets');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Users can update own business assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'business-assets');
