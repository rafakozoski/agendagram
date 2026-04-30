import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarCheck, Settings, Store, Package, Users, ListChecks, Image, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { AdminSettingsTab } from "@/components/platform/AdminSettingsTab";
import { BookingsTab } from "@/components/platform/BookingsTab";
import { BusinessesTab } from "@/components/platform/BusinessesTab";
import { UsersTab } from "@/components/platform/UsersTab";
import { ServiceCatalogTab } from "@/components/platform/ServiceCatalogTab";
import { BannersTab } from "@/components/platform/BannersTab";
import { SalesTab } from "@/components/platform/SalesTab";

export default function AdminPanel() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Administração da Plataforma</h1>
          <p className="text-muted-foreground mb-8">
            Gestão global do Agendagram — empresas, usuários, vendas e configurações da plataforma
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
            <TabsTrigger value="service-catalog" className="gap-2">
              <ListChecks className="w-4 h-4" />
              Catálogo Serviços
            </TabsTrigger>
            <TabsTrigger value="all-bookings" className="gap-2">
              <Package className="w-4 h-4" />
              Todas Reservas
            </TabsTrigger>
            <TabsTrigger value="sales" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Vendas
            </TabsTrigger>
            <TabsTrigger value="banners" className="gap-2">
              <Image className="w-4 h-4" />
              Banners
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

          <TabsContent value="service-catalog">
            <ServiceCatalogTab />
          </TabsContent>

          <TabsContent value="all-bookings">
            <BookingsTab />
          </TabsContent>

          <TabsContent value="banners">
            <BannersTab />
          </TabsContent>

          <TabsContent value="sales">
            <SalesTab />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
