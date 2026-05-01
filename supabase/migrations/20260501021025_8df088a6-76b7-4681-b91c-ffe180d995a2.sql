
-- Backfill: atribuir role 'owner' a todos os usuários que possuem negócios mas não têm role
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT b.owner_id, 'owner'::app_role
FROM public.businesses b
WHERE b.owner_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles r
    WHERE r.user_id = b.owner_id AND r.role = 'owner'
  )
ON CONFLICT (user_id, role) DO NOTHING;

-- Trigger: ao criar um negócio, garantir que o owner tenha a role 'owner'
CREATE OR REPLACE FUNCTION public.ensure_owner_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.owner_id, 'owner'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_owner_role ON public.businesses;
CREATE TRIGGER trg_ensure_owner_role
AFTER INSERT ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION public.ensure_owner_role();
