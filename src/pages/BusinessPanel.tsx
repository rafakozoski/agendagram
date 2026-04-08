import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarCheck, Store, CreditCard, User, Building2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusinessSettingsTab } from "@/components/admin/BusinessSettingsTab";
import { BusinessBookingsTab } from "@/components/admin/BusinessBookingsTab";
import { BusinessPaymentTab } from "@/components/admin/BusinessPaymentTab";
import { ClientsTab } from "@/components/admin/ClientsTab";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { useAuth } from "@/hooks/useAuth";

export default function BusinessPanel() {
  const { isProfessional, ownedBusinesses, selectedBusinessId, selectBusiness, business } = useMyBusiness();
  const { user } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "";

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                {isProfessional ? "Minha Agenda" : "Meu Negócio"}
              </h1>
              <p className="text-muted-foreground">
                {isProfessional ? "Gerencie seus agendamentos" : "Gerencie seu negócio"}
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
              <TabsContent value="payments">
                <BusinessPaymentTab />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
