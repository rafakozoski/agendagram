
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  link_url text DEFAULT '',
  position text NOT NULL DEFAULT 'top',
  sort_order integer DEFAULT 0,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled banners"
  ON public.banners FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage banners"
  ON public.banners FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
