import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarCheck, Settings, Store, Package, Users } from "lucide-react";
import { motion } from "framer-motion";
import { AdminSettingsTab } from "@/components/admin/AdminSettingsTab";
import { BookingsTab } from "@/components/admin/BookingsTab";
import { BusinessesTab } from "@/components/admin/BusinessesTab";
import { UsersTab } from "@/components/admin/UsersTab";

export default function AdminPanel() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground mb-8">
            Gestão global da plataforma Reservagram
          </p>
        </motion.div>

        <Tabs defaultValue="businesses" className="space-y-6">
          <TabsList className="bg-card border flex-wrap">
            <TabsTrigger value="businesses" className="gap-2">
              <Store className="w-4 h-4" />
              Empresas
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="all-bookings" className="gap-2">
              <Package className="w-4 h-4" />
              Todas Reservas
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Categorias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="businesses">
            <BusinessesTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="all-bookings">
            <BookingsTab />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
