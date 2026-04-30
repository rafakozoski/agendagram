import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, LogIn, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminLogin = location.pathname.startsWith("/admin");
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const resolvePanel = async () => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "");
    const roles = data?.map((r) => r.role) ?? [];
    if (roles.includes("admin")) return "/admin";
    if (roles.includes("owner")) return "/painel";
    return "/contratar";
  };

  // Garante que o usuário recém-cadastrado tenha role 'owner' (acesso ao painel do negócio).
  // Idempotente: se já existir, ignora silenciosamente.
  const ensureOwnerRole = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "owner" });
    // 23505 = unique_violation (já tem a role). Outros erros não bloqueiam o fluxo.
    if (error && error.code !== "23505") {
      console.warn("Falha ao atribuir role owner:", error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
        const dest = await resolvePanel();
        navigate(dest);
      } else {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (signUpData.session && signUpData.user) {
          await ensureOwnerRole(signUpData.user.id);
          toast.success("Cadastro realizado! Redirecionando...");
          const dest = await resolvePanel();
          navigate(dest);
        } else {
          toast.success("Cadastro realizado! Verifique seu e-mail para confirmar.");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  // No /admin/login só permitimos entrar (não criar conta)
  const allowSignup = !isAdminLogin;
  const HeaderIcon = isAdminLogin ? Shield : LogIn;
  const headerBgClass = isAdminLogin
    ? "bg-foreground"
    : "gradient-primary shadow-glow";
  const iconColorClass = isAdminLogin ? "text-background" : "text-primary-foreground";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className={`w-12 h-12 rounded-xl ${headerBgClass} flex items-center justify-center mx-auto mb-3`}>
              <HeaderIcon className={`w-6 h-6 ${iconColorClass}`} />
            </div>
            <CardTitle className="text-2xl">
              {isAdminLogin
                ? "Acesso Administrativo"
                : isLogin ? "Entrar" : "Criar conta"}
            </CardTitle>
            <CardDescription>
              {isAdminLogin
                ? "Área restrita à administração da plataforma"
                : isLogin ? "Acesse o painel do seu negócio" : "Crie sua conta no Agendagram"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
              <Button
                type="submit"
                className={`w-full ${isAdminLogin ? "bg-foreground text-background hover:bg-foreground/90" : "gradient-primary text-primary-foreground"}`}
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLogin ? "Entrar" : "Cadastrar"}
              </Button>
            </form>
            {allowSignup && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
