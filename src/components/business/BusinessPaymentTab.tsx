import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Crown, Loader2, Zap, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const PLANS = {
  basic: {
    name: "Básico",
    monthlyPrice: "29,90",
    yearlyPrice: "23,92",
    monthlyPriceId: "price_1T7Pe5JwkjwrgXgTJQBG5DKM",
    yearlyPriceId: "price_1TMHybJwkjwrgXgTGSbV9XiD",
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
    monthlyPrice: "49,90",
    yearlyPrice: "39,92",
    monthlyPriceId: "price_1T7PecJwkjwrgXgTB9n8JMTb",
    yearlyPriceId: "price_1TMHyxJwkjwrgXgTBlLn9OhI",
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
  const [isAnnual, setIsAnnual] = useState(false);

  const currentProductId = subscription?.product_id;
  const isSubscribed = subscription?.subscribed === true;
  const currentPlanKey = Object.entries(PLANS).find(([, p]) => p.productId === currentProductId)?.[0];

  const handleSubscribe = async (plan: typeof PLANS.basic, planKey: string) => {
    const priceId = isAnnual ? plan.yearlyPriceId : plan.monthlyPriceId;
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

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <Label htmlFor="billing-toggle-biz" className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
          Mensal
        </Label>
        <Switch
          id="billing-toggle-biz"
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
        />
        <Label htmlFor="billing-toggle-biz" className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
          Anual
        </Label>
        {isAnnual && (
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
            20% OFF
          </Badge>
        )}
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(PLANS).map(([key, plan]) => {
          const isCurrentPlan = currentProductId === plan.productId;
          const Icon = plan.icon;
          const displayPrice = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;

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
                      <span className="text-xl font-bold text-foreground">R${displayPrice}</span>/mês
                      {isAnnual && (
                        <span className="ml-2 line-through text-xs">R${plan.monthlyPrice}</span>
                      )}
                    </p>
                    {isAnnual && (
                      <p className="text-xs text-muted-foreground">Cobrado anualmente</p>
                    )}
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
                  onClick={() => handleSubscribe(plan, key)}
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
