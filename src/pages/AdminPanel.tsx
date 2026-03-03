import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarCheck, Settings, Store, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useUserRole } from "@/hooks/useUserRole";
import { AdminSettingsTab } from "@/components/admin/AdminSettingsTab";
import { BusinessSettingsTab } from "@/components/admin/BusinessSettingsTab";
import { BusinessBookingsTab } from "@/components/admin/BusinessBookingsTab";
import { BookingsTab } from "@/components/admin/BookingsTab";

export default function AdminPanel() {
  const { isAdmin } = useUserRole();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Painel Reservagram</h1>
          <p className="text-muted-foreground mb-8">
            {isAdmin ? "Administração da plataforma e do seu negócio" : "Gerencie seu negócio"}
          </p>
        </motion.div>

        <Tabs defaultValue="agenda" className="space-y-6">
          <TabsList className="bg-card border flex-wrap">
            <TabsTrigger value="agenda" className="gap-2">
              <CalendarCheck className="w-4 h-4" />
              Agenda
            </TabsTrigger>
            <TabsTrigger value="business" className="gap-2">
              <Store className="w-4 h-4" />
              Minha Empresa
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="all-bookings" className="gap-2">
                  <Package className="w-4 h-4" />
                  Todas Reservas
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Configurações
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="agenda">
            <BusinessBookingsTab />
          </TabsContent>

          <TabsContent value="business">
            <BusinessSettingsTab />
          </TabsContent>

          {isAdmin && (
            <>
              <TabsContent value="all-bookings">
                <BookingsTab />
              </TabsContent>
              <TabsContent value="settings">
                <AdminSettingsTab />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
