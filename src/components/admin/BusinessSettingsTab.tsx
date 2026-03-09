import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, Loader2, Store, Users, Package, Clock, ImagePlus, X, UserPlus, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useLocations } from "@/hooks/useLocations";

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function BusinessSettingsTab() {
  const { user } = useAuth();
  const { business, isLoading: bizLoading, refetch: refetchBiz } = useMyBusiness();
  const queryClient = useQueryClient();
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", slug: "", description: "", category: "beleza",
    state: "", city: "", neighborhood: "", address: "", phone: "",
    cover_url: "",
  });
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    if (business) {
      const b = business as any;
      const stateKey = dbStates.find(s => s.name === b.state)?.code || b.state || "";
      setForm({
        name: b.name || "",
        slug: b.slug || "",
        description: b.description || "",
        category: b.category || "beleza",
        state: stateKey,
        city: b.city || "",
        neighborhood: b.neighborhood || "",
        address: b.address || "",
        phone: b.phone || "",
        cover_url: b.cover_url || "",
      });
      if (b.cover_url) setBannerPreview(b.cover_url);
    }
  }, [business]);

  const { states: dbStates, getCities, getNeighborhoods: getDbNeighborhoods, findStateByCity: dbFindState, getAllCitiesWithState } = useLocations();
  const citiesToShow = form.state ? getCities(form.state).map(c => ({ city: c, stateKey: form.state, stateName: dbStates.find(s => s.code === form.state)?.name || "" })) : getAllCitiesWithState();
  const selectedNeighborhoods = (form.state && form.city)
    ? getDbNeighborhoods(form.city, form.state)
    : [];

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 3MB.");
      return;
    }
    setUploadingBanner(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `banners/${user!.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("business-assets").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("business-assets").getPublicUrl(path);
      setForm((f) => ({ ...f, cover_url: data.publicUrl }));
      setBannerPreview(data.publicUrl);
      toast.success("Banner carregado!");
    } catch (err: any) {
      toast.error("Erro ao enviar banner: " + (err.message || ""));
    } finally {
      setUploadingBanner(false);
    }
  };

  const removeBanner = () => {
    setForm((f) => ({ ...f, cover_url: "" }));
    setBannerPreview("");
  };

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").eq("enabled", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ["biz-services", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data, error } = await supabase.from("services").select("*").eq("business_id", business.id).order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  const { data: professionals = [] } = useQuery({
    queryKey: ["biz-professionals", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data, error } = await supabase.from("professionals").select("*").eq("business_id", business.id).order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

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

  const { data: serviceCatalog = [] } = useQuery({
    queryKey: ["service-catalog"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_catalog").select("name").order("name");
      if (error) throw error;
      return data.map((s) => s.name);
    },
  });

  const seedAvailability = async (businessId: string) => {
    const { data: existing } = await supabase.from("availability").select("id").eq("business_id", businessId).limit(1);
    if (!existing || existing.length === 0) {
      await supabase.from("availability").insert(
        [0,1,2,3,4,5,6].map(d => ({
          business_id: businessId,
          day_of_week: d,
          start_time: "09:00",
          end_time: "18:00",
          enabled: d >= 1 && d <= 5,
        }))
      );
    }
  };

  const saveBusiness = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        state: form.state ? (dbStates.find(s => s.code === form.state)?.name || form.state) : form.state,
      };
      if (business) {
        const { error } = await supabase.from("businesses").update(payload).eq("id", business.id);
        if (error) throw error;
        // Seed availability if missing for existing business
        await seedAvailability(business.id);
      } else {
        const { error } = await supabase.from("businesses").insert({ ...payload, owner_id: user!.id });
        if (error) throw error;
        const { data: newBiz } = await supabase.from("businesses").select("id").eq("owner_id", user!.id).single();
        if (newBiz) {
          await seedAvailability(newBiz.id);
        }
      }
    },
    onSuccess: () => {
      refetchBiz();
      queryClient.invalidateQueries({ queryKey: ["biz-availability"] });
      toast.success(business ? "Dados atualizados!" : "Empresa criada!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const addService = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("services").insert({ name: "Novo Serviço", business_id: business!.id, price: 0, duration: 30 });
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["biz-services"] }); toast.success("Serviço removido"); },
  });

  const addProfessional = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("professionals").insert({ name: "Novo Profissional", business_id: business!.id, role: "" });
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["biz-professionals"] }); toast.success("Profissional removido"); },
  });

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
        <CardContent className="space-y-6">

          {/* Banner Upload - Only for Pro/Featured businesses */}
          {(business as any)?.featured ? (
            <div>
              <Label className="mb-2 block">Banner de topo do negócio</Label>
              {bannerPreview ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border">
                  <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeBanner}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploadingBanner}
                  className="w-full h-40 rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                >
                  {uploadingBanner
                    ? <Loader2 className="w-6 h-6 animate-spin" />
                    : <><ImagePlus className="w-8 h-8" /><span className="text-sm">Clique para enviar o banner (JPG, PNG — máx. 3MB)</span><span className="text-xs text-muted-foreground">Tamanho ideal: 1200 × 400 px</span></>
                  }
                </button>
              )}
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleBannerUpload}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-4 flex items-center gap-3 text-muted-foreground">
              <ImagePlus className="w-5 h-5 shrink-0" />
              <p className="text-sm">O banner de topo está disponível apenas para planos <strong className="text-foreground">Pro (Destaque)</strong>.</p>
            </div>
          )}

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

            {/* Estado */}
            <div>
              <Label>Estado</Label>
              <Select
                value={form.state}
                onValueChange={(v) => setForm({ ...form, state: v, city: "", neighborhood: "" })}
              >
                <SelectTrigger><SelectValue placeholder="Selecione o estado" /></SelectTrigger>
                <SelectContent>
                  {dbStates.map((s) => (
                    <SelectItem key={s.code} value={s.code}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cidade */}
            <div>
              <Label>Cidade</Label>
              <Select
                value={form.city}
                onValueChange={(v) => {
                  const stateKey = dbFindState(v);
                  setForm({ ...form, city: v, neighborhood: "", state: stateKey || form.state });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Selecione a cidade" /></SelectTrigger>
                <SelectContent>
                  {citiesToShow.map((c) => (
                    <SelectItem key={`${c.stateKey}-${c.city}`} value={c.city}>
                      {c.city} {!form.state && `(${c.stateKey})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bairro */}
            <div>
              <Label>Bairro</Label>
              <Select
                value={form.neighborhood}
                onValueChange={(v) => setForm({ ...form, neighborhood: v })}
                disabled={!form.city}
              >
                <SelectTrigger><SelectValue placeholder={form.city ? "Selecione o bairro" : "Escolha a cidade primeiro"} /></SelectTrigger>
                <SelectContent>
                  {selectedNeighborhoods.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Endereço</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rua, número" />
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
              <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" />Serviços</CardTitle>
              <Button onClick={() => addService.mutate()} size="sm" className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {services.map((svc) => (
                <div key={svc.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 rounded-lg border items-end">
                  <div className="md:col-span-2">
                    <Label>Nome</Label>
                    <AutocompleteInput
                      suggestions={serviceCatalog}
                      value={svc.name}
                      onValueChange={(val) => updateService.mutate({ id: svc.id, updates: { name: val } })}
                      placeholder="Digite o nome do serviço..."
                    />
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
          <ProfessionalsSection
            business={business}
            professionals={professionals}
            addProfessional={addProfessional}
            updateProfessional={updateProfessional}
            deleteProfessional={deleteProfessional}
            queryClient={queryClient}
          />

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" />Horários de Funcionamento</CardTitle>
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
                      <Input type="time" defaultValue={slot.start_time} onBlur={(e) => updateAvailability.mutate({ id: slot.id, updates: { start_time: e.target.value } })} className="w-32" />
                      <span className="text-muted-foreground">até</span>
                      <Input type="time" defaultValue={slot.end_time} onBlur={(e) => updateAvailability.mutate({ id: slot.id, updates: { end_time: e.target.value } })} className="w-32" />
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

function ProfessionalsSection({ business, professionals, addProfessional, updateProfessional, deleteProfessional, queryClient }: any) {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedPro, setSelectedPro] = useState<any>(null);
  const [userForm, setUserForm] = useState({ email: "", password: "" });
  const [creating, setCreating] = useState(false);

  const createProfessionalUser = async () => {
    if (!selectedPro || !userForm.email || !userForm.password) return;
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("create-professional-user", {
        body: {
          professionalId: selectedPro.id,
          email: userForm.email,
          password: userForm.password,
        },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      queryClient.invalidateQueries({ queryKey: ["biz-professionals"] });
      setShowCreateUser(false);
      setUserForm({ email: "", password: "" });
      setSelectedPro(null);
      toast.success("Usuário criado e vinculado ao profissional!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar usuário");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />Profissionais</CardTitle>
          <Button onClick={() => addProfessional.mutate()} size="sm" className="gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {professionals.map((pro: any) => (
            <div key={pro.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded-lg border items-end">
              <div>
                <Label>Nome</Label>
                <Input defaultValue={pro.name} onBlur={(e) => updateProfessional.mutate({ id: pro.id, updates: { name: e.target.value } })} />
              </div>
              <div>
                <Label>Função</Label>
                <Input defaultValue={pro.role} onBlur={(e) => updateProfessional.mutate({ id: pro.id, updates: { role: e.target.value } })} />
              </div>
              <div>
                <Label>Acesso</Label>
                {pro.user_id ? (
                  <Badge variant="default" className="flex items-center gap-1 w-fit h-10 px-3">
                    <UserCheck className="w-3.5 h-3.5" />
                    Vinculado
                  </Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-full"
                    onClick={() => { setSelectedPro(pro); setUserForm({ email: "", password: "" }); setShowCreateUser(true); }}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Criar Acesso
                  </Button>
                )}
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

      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Criar Acesso para {selectedPro?.name}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            O profissional poderá fazer login e visualizar/gerenciar apenas sua própria agenda.
          </p>
          <div className="space-y-4">
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="profissional@email.com"
              />
            </div>
            <div>
              <Label>Senha *</Label>
              <Input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <Button
              className="w-full gradient-primary text-primary-foreground"
              onClick={createProfessionalUser}
              disabled={creating || !userForm.email.trim() || userForm.password.length < 6}
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Criar Acesso
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
