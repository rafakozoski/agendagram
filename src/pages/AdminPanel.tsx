import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_SERVICES, MOCK_PROFESSIONALS, DEFAULT_AVAILABILITY, type Service, type Availability } from "@/lib/scheduling";
import { Plus, Trash2, Clock, Calendar, Users, Package, CalendarCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BookingsTab } from "@/components/admin/BookingsTab";

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default function AdminPanel() {
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [availability, setAvailability] = useState<Availability[]>(DEFAULT_AVAILABILITY);

  const toggleDay = (dayOfWeek: number) => {
    setAvailability((prev) =>
      prev.map((a) => (a.dayOfWeek === dayOfWeek ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const updateTime = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setAvailability((prev) =>
      prev.map((a) => (a.dayOfWeek === dayOfWeek ? { ...a, [field]: value } : a))
    );
  };

  const addService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: "Novo Serviço",
      type: "service",
      price: 0,
      duration: 30,
      description: "",
    };
    setServices([...services, newService]);
  };

  const removeService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
    toast.success("Serviço removido");
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices(services.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground mb-8">Gerencie serviços, profissionais e disponibilidade</p>
        </motion.div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="bg-card border">
            <TabsTrigger value="bookings" className="gap-2">
              <CalendarCheck className="w-4 h-4" />
              Agenda
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <Package className="w-4 h-4" />
              Serviços
            </TabsTrigger>
            <TabsTrigger value="professionals" className="gap-2">
              <Users className="w-4 h-4" />
              Profissionais
            </TabsTrigger>
            <TabsTrigger value="availability" className="gap-2">
              <Clock className="w-4 h-4" />
              Disponibilidade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <BookingsTab />
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Serviços e Produtos</CardTitle>
                <Button onClick={addService} size="sm" className="gradient-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 rounded-lg border items-end">
                    <div className="md:col-span-2">
                      <Label>Nome</Label>
                      <Input
                        value={service.name}
                        onChange={(e) => updateService(service.id, { name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <Select
                        value={service.type}
                        onValueChange={(v) => updateService(service.id, { type: v as 'service' | 'product' })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">Serviço</SelectItem>
                          <SelectItem value="product">Produto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Preço (R$)</Label>
                      <Input
                        type="number"
                        value={service.price}
                        onChange={(e) => updateService(service.id, { price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Duração (min)</Label>
                      <Input
                        type="number"
                        value={service.duration}
                        onChange={(e) => updateService(service.id, { duration: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => removeService(service.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professionals">
            <Card>
              <CardHeader>
                <CardTitle>Profissionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {MOCK_PROFESSIONALS.map((pro) => (
                  <div key={pro.id} className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{pro.name}</p>
                      <p className="text-sm text-muted-foreground">{pro.role}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {pro.services.length} serviço(s)
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full border-dashed">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar profissional
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Horários de Funcionamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {availability.map((slot) => (
                  <div key={slot.dayOfWeek} className="flex items-center gap-4 p-3 rounded-lg border">
                    <Switch checked={slot.enabled} onCheckedChange={() => toggleDay(slot.dayOfWeek)} />
                    <span className={`w-24 font-medium text-sm ${!slot.enabled ? "text-muted-foreground" : ""}`}>
                      {DAY_NAMES[slot.dayOfWeek]}
                    </span>
                    {slot.enabled && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateTime(slot.dayOfWeek, 'startTime', e.target.value)}
                          className="w-32"
                        />
                        <span className="text-muted-foreground">até</span>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateTime(slot.dayOfWeek, 'endTime', e.target.value)}
                          className="w-32"
                        />
                      </div>
                    )}
                    {!slot.enabled && (
                      <span className="text-sm text-muted-foreground">Fechado</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
