ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS half_height boolean NOT NULL DEFAULT false;

ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS site_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS site_headline text DEFAULT '';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS site_subheadline text DEFAULT '';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS site_about text DEFAULT '';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS site_gallery jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS site_features jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS site_testimonials jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS site_instagram text DEFAULT '';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS site_whatsapp text DEFAULT '';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS site_cta_label text DEFAULT '';