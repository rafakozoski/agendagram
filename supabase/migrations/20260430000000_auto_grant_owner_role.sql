-- Auto-grant role 'owner' a todo novo usuário cadastrado
-- e backfill dos usuários existentes que ainda não a possuem.
-- Saneamento da arquitetura de papéis (admin = plataforma, owner = dono de negócio).

-- Trigger function: chamada após cada INSERT em auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user_owner_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'owner'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recria o trigger (idempotente)
DROP TRIGGER IF EXISTS on_auth_user_created_grant_owner ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_owner
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_owner_role();

-- RLS: permite ao próprio usuário se autogarantir 'owner' (fallback caso o trigger falhe).
-- Restrito a role='owner' — usuários NÃO podem se autogarantir 'admin'.
DROP POLICY IF EXISTS "Users can self-grant owner role" ON public.user_roles;
CREATE POLICY "Users can self-grant owner role" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND role = 'owner');

-- Backfill: garante que todo usuário já cadastrado tenha role 'owner'
-- (exceto admins, que continuam tendo as roles que possuem)
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'owner'::app_role
FROM auth.users u
LEFT JOIN public.user_roles ur
  ON ur.user_id = u.id AND ur.role = 'owner'
WHERE ur.id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;
