import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarCheck, Store, CreditCard, User, Building2, Users, Globe, Plus, Lock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BusinessSettingsTab } from "@/components/business/BusinessSettingsTab";
import { BusinessBookingsTab } from "@/components/business/BusinessBookingsTab";
import { BusinessPaymentTab } from "@/components/business/BusinessPaymentTab";
import { ClientsTab } from "@/components/business/ClientsTab";
import { BusinessSiteTab } from "@/components/business/BusinessSiteTab";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function BusinessPanel() {
  const { isProfessional, ownedBusinesses, selectedBusinessId, selectBusiness, business, refetch } = useMyBusiness();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [showNewUnit, setShowNewUnit] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isPro = subscription?.subscribed;

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "";

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-5 md:py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                {isProfessional ? "Minha Agenda" : "Painel do Negócio"}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {isProfessional ? "Gerencie seus agendamentos" : "Administre sua empresa, agenda, clientes e pagamentos"}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Business selector for owners with multiple businesses */}
              {!isProfessional && ownedBusinesses.length > 1 && (
                <Select value={selectedBusinessId || ""} onValueChange={selectBusiness}>
                  <SelectTrigger className="w-52 bg-card">
                    <Building2 className="w-4 h-4 mr-2 text-primary" />
                    <SelectValue placeholder="Selecionar unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {ownedBusinesses.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {/* "+ Nova unidade" para multi-unit (plano Pro). Free/Basic veem prompt de upgrade. */}
              {!isProfessional && ownedBusinesses.length >= 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => (isPro ? setShowNewUnit(true) : setShowUpgrade(true))}
                  className="gap-1"
                >
                  {isPro ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  Nova unidade
                </Button>
              )}
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-2 text-sm font-normal w-fit">
                <User className="w-4 h-4 text-primary" />
                <span className="font-medium">{displayName}</span>
                <span className="text-muted-foreground hidden sm:inline">· {user?.email}</span>
              </Badge>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="agenda" className="space-y-6">
          <TabsList className="bg-card border flex-wrap">
            <TabsTrigger value="agenda" className="gap-2">
              <CalendarCheck className="w-4 h-4" />
              Agenda
            </TabsTrigger>
            {!isProfessional && (
              <>
                <TabsTrigger value="clients" className="gap-2">
                  <Users className="w-4 h-4" />
                  Clientes
                </TabsTrigger>
                <TabsTrigger value="business" className="gap-2">
                  <Store className="w-4 h-4" />
                  Minha Empresa
                </TabsTrigger>
                <TabsTrigger value="site" className="gap-2">
                  <Globe className="w-4 h-4" />
                  Mini-site
                </TabsTrigger>
                <TabsTrigger value="payments" className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  Pagamentos
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="agenda">
            <BusinessBookingsTab />
          </TabsContent>

          {!isProfessional && (
            <>
              <TabsContent value="clients">
                <ClientsTab />
              </TabsContent>
              <TabsContent value="business">
                <BusinessSettingsTab />
              </TabsContent>
              <TabsContent value="site">
                <BusinessSiteTab />
              </TabsContent>
              <TabsContent value="payments">
                <BusinessPaymentTab />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      {/* Dialog: criar nova unidade (multi-unit Pro) */}
      <NewUnitDialog
        open={showNewUnit}
        onOpenChange={setShowNewUnit}
        userId={user?.id}
        onCreated={(newId) => {
          refetch();
          selectBusiness(newId);
          toast.success("Nova unidade criada! Complete os dados em 'Minha Empresa'.");
        }}
      />

      {/* Dialog: upgrade prompt (free/basic tentando criar 2ª unidade) */}
      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Múltiplas unidades — plano Pro
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Gerenciar mais de uma unidade (franquia) é uma funcionalidade do plano <strong className="text-foreground">Pro</strong>.
              Com Pro você cadastra até 5 unidades sob o mesmo dono e alterna entre elas com 1 clique.
            </p>
            <ul className="text-sm space-y-1.5 pl-1">
              <li>• Até 5 unidades por conta</li>
              <li>• Agenda separada por unidade</li>
              <li>• Banner de destaque + mini-site em cada unidade</li>
            </ul>
            <Link to="/planos" className="block">
              <Button className="w-full gradient-primary text-primary-foreground">
                Ver planos
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Dialog leve pra criar uma nova unidade — só nome+slug. Os outros campos
// são preenchidos depois na aba "Minha Empresa".
function NewUnitDialog({
  open,
  onOpenChange,
  userId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  userId?: string;
  onCreated: (newId: string) => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!userId || !name.trim() || !slug.trim()) return;
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("businesses")
        .insert({ name: name.trim(), slug: slug.trim(), category: "beleza", owner_id: userId })
        .select("id")
        .single();
      if (error) throw error;
      // Seed availability default (mesma lógica do BusinessSettingsTab)
      await supabase.from("availability").insert(
        [0, 1, 2, 3, 4, 5, 6].map((d) => ({
          business_id: data!.id,
          day_of_week: d,
          start_time: "09:00",
          end_time: "18:00",
          enabled: d >= 1 && d <= 5,
        }))
      );
      onCreated(data!.id);
      onOpenChange(false);
      setName("");
      setSlug("");
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar unidade");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova unidade</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Cadastre apenas o nome e o link da nova unidade. Os demais dados (endereço,
            serviços, profissionais) você completa depois.
          </p>
          <div>
            <Label>Nome da unidade *</Label>
            <Input
              value={name}
              onChange={(e) => {
                const v = e.target.value;
                setName(v);
                // auto-gera slug se ainda não foi mexido
                if (!slug || slug === slug.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")) {
                  setSlug(
                    v.toLowerCase()
                      .normalize("NFD")
                      .replace(/[̀-ͯ]/g, "")
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, "")
                  );
                }
              }}
              placeholder="Ex: Barbearia X — Filial Centro"
            />
          </div>
          <div>
            <Label>Link público (slug) *</Label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">/</span>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="barbearia-x-centro"
              />
            </div>
          </div>
          <Button
            onClick={handleCreate}
            disabled={creating || !name.trim() || !slug.trim()}
            className="w-full gradient-primary text-primary-foreground"
          >
            {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Criar unidade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
