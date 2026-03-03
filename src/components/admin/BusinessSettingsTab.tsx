import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save, Loader2, Store, Users, Package, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function BusinessSettingsTab() {
  const { user } = useAuth();
  const { business, isLoading: bizLoading, refetch: refetchBiz } = useMyBusiness();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "", slug: "", description: "", category: "beleza",
    city: "", neighborhood: "", address: "", phone: "",
  });

  useEffect(() => {
    if (business) {
      setForm({
        name: business.name || "",
        slug: business.slug || "",
        description: business.description || "",
        category: business.category || "beleza",
        city: business.city || "",
        neighborhood: (business as any).neighborhood || "",
        address: business.address || "",
        phone: business.phone || "",
      });
    }
  }, [business]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").eq("enabled", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Services
  const { data: services = [], isLoading: svcLoading } = useQuery({
    queryKey: ["biz-services", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data, error } = await supabase.from("services").select("*").eq("business_id", business.id).order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  // Professionals
  const { data: professionals = [], isLoading: proLoading } = useQuery({
    queryKey: ["biz-professionals", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data, error } = await supabase.from("professionals").select("*").eq("business_id", business.id).order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  // Availability
  const { data: availability = [] } = useQuery({
    queryKey: ["biz-availability", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data, error } = await supabase.from("availability").select("*").eq("business_id", business.id).order("day_of_week");
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  const saveBusiness = useMutation({
    mutationFn: async () => {
      if (business) {
        const { error } = await supabase.from("businesses")
          .update({ ...form })
          .eq("id", business.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("businesses")
          .insert({ ...form, owner_id: user!.id });
        if (error) throw error;
        // Create default availability
        const days = [0,1,2,3,4,5,6];
        const { data: newBiz } = await supabase.from("businesses").select("id").eq("owner_id", user!.id).single();
        if (newBiz) {
          await supabase.from("availability").insert(
            days.map(d => ({
              business_id: newBiz.id,
              day_of_week: d,
              start_time: "09:00",
              end_time: "18:00",
              enabled: d >= 1 && d <= 5,
            }))
          );
        }
      }
    },
    onSuccess: () => {
      refetchBiz();
      queryClient.invalidateQueries({ queryKey: ["biz-availability"] });
      toast.success(business ? "Dados atualizados" : "Empresa criada!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Service CRUD
  const addService = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("services").insert({
        name: "Novo Serviço", business_id: business!.id, price: 0, duration: 30,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["biz-services"] }),
  });

  const updateService = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase.from("services").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["biz-services"] }),
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biz-services"] });
      toast.success("Serviço removido");
    },
  });

  // Professional CRUD
  const addProfessional = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("professionals").insert({
        name: "Novo Profissional", business_id: business!.id, role: "",
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["biz-professionals"] }),
  });

  const updateProfessional = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase.from("professionals").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["biz-professionals"] }),
  });

  const deleteProfessional = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("professionals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biz-professionals"] });
      toast.success("Profissional removido");
    },
  });

  // Availability update
  const updateAvailability = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase.from("availability").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["biz-availability"] }),
  });

  if (bizLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            {business ? "Dados da Empresa" : "Criar Empresa"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>URL (slug)</Label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">/</span>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                  placeholder="meu-negocio"
                />
              </div>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <Label>Bairro</Label>
              <Input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Endereço</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Descrição</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <Button onClick={() => saveBusiness.mutate()} className="gradient-primary text-primary-foreground">
            {saveBusiness.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {business ? "Salvar alterações" : "Criar empresa"}
          </Button>
        </CardContent>
      </Card>

      {business && (
        <>
          {/* Services */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Serviços
              </CardTitle>
              <Button onClick={() => addService.mutate()} size="sm" className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {services.map((svc) => (
                <div key={svc.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 rounded-lg border items-end">
                  <div className="md:col-span-2">
                    <Label>Nome</Label>
                    <Input defaultValue={svc.name} onBlur={(e) => updateService.mutate({ id: svc.id, updates: { name: e.target.value } })} />
                  </div>
                  <div>
                    <Label>Preço (R$)</Label>
                    <Input type="number" defaultValue={svc.price} onBlur={(e) => updateService.mutate({ id: svc.id, updates: { price: parseFloat(e.target.value) || 0 } })} />
                  </div>
                  <div>
                    <Label>Duração (min)</Label>
                    <Input type="number" defaultValue={svc.duration} onBlur={(e) => updateService.mutate({ id: svc.id, updates: { duration: parseInt(e.target.value) || 30 } })} />
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => deleteService.mutate(svc.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {services.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhum serviço cadastrado.</p>}
            </CardContent>
          </Card>

          {/* Professionals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Profissionais
              </CardTitle>
              <Button onClick={() => addProfessional.mutate()} size="sm" className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {professionals.map((pro) => (
                <div key={pro.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-lg border items-end">
                  <div>
                    <Label>Nome</Label>
                    <Input defaultValue={pro.name} onBlur={(e) => updateProfessional.mutate({ id: pro.id, updates: { name: e.target.value } })} />
                  </div>
                  <div>
                    <Label>Função</Label>
                    <Input defaultValue={pro.role} onBlur={(e) => updateProfessional.mutate({ id: pro.id, updates: { role: e.target.value } })} />
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => deleteProfessional.mutate(pro.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {professionals.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhum profissional cadastrado.</p>}
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horários de Funcionamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availability.map((slot) => (
                <div key={slot.id} className="flex items-center gap-4 p-3 rounded-lg border">
                  <Switch
                    checked={slot.enabled}
                    onCheckedChange={(enabled) => updateAvailability.mutate({ id: slot.id, updates: { enabled } })}
                  />
                  <span className={`w-24 font-medium text-sm ${!slot.enabled ? "text-muted-foreground" : ""}`}>
                    {DAY_NAMES[slot.day_of_week]}
                  </span>
                  {slot.enabled ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        defaultValue={slot.start_time}
                        onBlur={(e) => updateAvailability.mutate({ id: slot.id, updates: { start_time: e.target.value } })}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">até</span>
                      <Input
                        type="time"
                        defaultValue={slot.end_time}
                        onBlur={(e) => updateAvailability.mutate({ id: slot.id, updates: { end_time: e.target.value } })}
                        className="w-32"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Fechado</span>
                  )}
                </div>
              ))}
              {availability.length === 0 && <p className="text-muted-foreground text-center py-4">Salve os dados da empresa primeiro.</p>}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
