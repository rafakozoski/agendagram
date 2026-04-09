import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Crown, Loader2, Sparkles, Zap, Gift, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const PLANS = {
  free: {
    name: "Gratuito",
    price: "0",
    priceId: null,
    productId: null,
    icon: ShieldCheck,
    features: [
      "Até 10 agendamentos por mês",
      "Listagem no marketplace",
      "Agenda online básica",
      "Painel administrativo",
    ],
    limitations: [
      "Sem destaque no marketplace",
      "Sem banner personalizado",
      "Sem relatórios avançados",
    ],
  },
  basic: {
    name: "Básico",
    price: "29,90",
    priceId: "price_1T7Pe5JwkjwrgXgTJQBG5DKM",
    productId: "prod_U5apRMMBVGaLJd",
    icon: Zap,
    features: [
      "Agendamentos ilimitados",
      "Listagem no marketplace",
      "Agenda online completa",
      "Painel administrativo",
      "Cadastro de serviços e profissionais",
      "Horários de funcionamento",
      "Notificações de agendamento",
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
      "Prioridade nos resultados de busca",
      "Relatórios avançados",
      "Suporte prioritário",
    ],
  },
};

export default function PricingPage() {
  const { user } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);

  const handleSubscribe = async (priceId: string | null, planKey: string) => {
    if (!priceId) return; // free plan
    if (!user) {
      navigate("/admin/login");
      return;
    }

    setLoadingPlan(planKey);
    try {
      const body: any = { priceId };
      if (coupon.trim()) body.coupon = coupon.trim();

      const { data, error } = await supabase.functions.invoke("create-checkout", { body });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao iniciar pagamento");
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentProductId = subscription?.product_id;
  const isFree = !subscription?.subscribed;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="gradient-primary text-primary-foreground mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Planos
          </Badge>
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Escolha o plano ideal para o seu negócio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comece a receber agendamentos online hoje mesmo. Cancele quando quiser.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {Object.entries(PLANS).map(([key, plan], index) => {
            const isCurrentPlan = key === "free" ? isFree : currentProductId === plan.productId;
            const Icon = plan.icon;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative overflow-hidden h-full flex flex-col ${
                  key === "pro" ? "border-primary shadow-glow" : "border"
                }`}>
                  {key === "pro" && (
                    <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
                      key === "pro" ? "gradient-primary shadow-glow" : "bg-muted"
                    }`}>
                      <Icon className={`w-7 h-7 ${key === "pro" ? "text-primary-foreground" : "text-foreground"}`} />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>
                      {key === "free" ? (
                        <span className="text-4xl font-bold text-foreground">Grátis</span>
                      ) : (
                        <>
                          <span className="text-4xl font-bold text-foreground">R${plan.price}</span>
                          <span className="text-muted-foreground">/mês</span>
                        </>
                      )}
                    </CardDescription>
                    {isCurrentPlan && (
                      <Badge variant="outline" className="mt-2 border-primary text-primary">
                        Seu plano atual
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 flex-1 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {"limitations" in plan && plan.limitations?.map((lim, i) => (
                        <li key={`lim-${i}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-4 h-4 shrink-0 mt-0.5 text-center">—</span>
                          <span>{lim}</span>
                        </li>
                      ))}
                    </ul>
                    {key === "free" ? (
                      <Button variant="outline" size="lg" className="w-full" disabled={isCurrentPlan}>
                        {isCurrentPlan ? "Plano atual" : "Começar grátis"}
                      </Button>
                    ) : (
                      <Button
                        className={`w-full ${key === "pro" ? "gradient-primary text-primary-foreground" : ""}`}
                        variant={key === "pro" ? "default" : "outline"}
                        size="lg"
                        disabled={isCurrentPlan || loadingPlan !== null}
                        onClick={() => handleSubscribe(plan.priceId, key)}
                      >
                        {loadingPlan === key && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isCurrentPlan ? "Plano atual" : "Assinar agora"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Coupon section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-md mx-auto mt-10 text-center"
        >
          {!showCoupon ? (
            <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={() => setShowCoupon(true)}>
              <Gift className="w-4 h-4" /> Tem um cupom de desconto?
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Digite seu cupom"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                className="text-center font-mono"
              />
              <Button variant="outline" onClick={() => setShowCoupon(false)}>OK</Button>
            </div>
          )}
          {coupon && (
            <p className="text-xs text-primary mt-2 flex items-center justify-center gap-1">
              <Gift className="w-3 h-3" /> Cupom "{coupon}" será aplicado no checkout
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
