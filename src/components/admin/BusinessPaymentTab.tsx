import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Loader2, Zap, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const PLANS = {
  basic: {
    name: "Básico",
    price: "29,90",
    priceId: "price_1T7Pe5JwkjwrgXgTJQBG5DKM",
    productId: "prod_U5apRMMBVGaLJd",
    icon: Zap,
    features: [
      "Listagem no marketplace",
      "Agenda online completa",
      "Painel administrativo",
      "Cadastro de serviços e profissionais",
    ],
  },
  pro: {
    name: "Pro",
    price: "49,90",
    priceId: "price_1T7PecJwkjwrgXgTB9n8JMTb",
    productId: "prod_U5aqds34W5m2LE",
    icon: Crown,
    features: [
      "Tudo do plano Básico",
      "Destaque no marketplace",
      "Banner personalizado",
      "Prioridade nos resultados",
    ],
  },
};

export function BusinessPaymentTab() {
  const { subscription, loading: subLoading, refresh } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const currentProductId = subscription?.product_id;
  const isSubscribed = subscription?.subscribed === true;
  const currentPlanKey = Object.entries(PLANS).find(([, p]) => p.productId === currentProductId)?.[0];

  const handleSubscribe = async (priceId: string, planKey: string) => {
    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Erro ao iniciar pagamento");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManage = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Erro ao abrir portal");
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Minha Assinatura
          </CardTitle>
          <CardDescription>
            Gerencie seu plano e pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verificando assinatura...
            </div>
          ) : isSubscribed ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="gradient-primary text-primary-foreground text-sm px-3 py-1">
                  Plano {currentPlanKey === "pro" ? "Pro" : "Básico"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Válido até {subscription?.subscription_end ? new Date(subscription.subscription_end).toLocaleDateString("pt-BR") : "—"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleManage} disabled={loadingPortal}>
                  {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <ExternalLink className="w-4 h-4 mr-1" />}
                  Gerenciar Assinatura
                </Button>
                <Button variant="ghost" size="sm" onClick={refresh}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Atualizar Status
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground">Você ainda não possui uma assinatura ativa.</p>
              <Button variant="ghost" size="sm" onClick={refresh}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Já paguei, verificar novamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(PLANS).map(([key, plan]) => {
          const isCurrentPlan = currentProductId === plan.productId;
          const Icon = plan.icon;

          return (
            <Card key={key} className={`relative overflow-hidden ${
              key === "pro" ? "border-primary shadow-glow" : ""
            } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}>
              {key === "pro" && (
                <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    key === "pro" ? "gradient-primary" : "bg-muted"
                  }`}>
                    <Icon className={`w-5 h-5 ${key === "pro" ? "text-primary-foreground" : "text-foreground"}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      <span className="text-xl font-bold text-foreground">R${plan.price}</span>/mês
                    </p>
                  </div>
                  {isCurrentPlan && (
                    <Badge variant="outline" className="ml-auto border-primary text-primary">
                      Atual
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${key === "pro" ? "gradient-primary text-primary-foreground" : ""}`}
                  variant={key === "pro" ? "default" : "outline"}
                  disabled={isCurrentPlan || loadingPlan !== null}
                  onClick={() => handleSubscribe(plan.priceId, key)}
                >
                  {loadingPlan === key && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isCurrentPlan ? "Plano atual" : "Assinar"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
