import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Star, Loader2, Store, Edit, Eye } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocations } from "@/hooks/useLocations";

export function BusinessesTab() {
  const { user } = useAuth();
  const { states, getCities, getNeighborhoods, findStateByCity, getAllCitiesWithState } = useLocations();
  const queryClient = useQueryClient();
  const [editBiz, setEditBiz] = useState<any>(null);
  const [showNewBiz, setShowNewBiz] = useState(false);
  const emptyBizForm = { name: "", slug: "", category: "beleza", state: "", city: "", neighborhood: "", phone: "", description: "", ownerEmail: "" };
  const [bizForm, setBizForm] = useState(emptyBizForm);
  const [ownerLookup, setOwnerLookup] = useState<{ id: string; email: string } | null>(null);
  const [ownerLookupError, setOwnerLookupError] = useState("");
  const [lookingUpOwner, setLookingUpOwner] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["all-businesses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("businesses").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase.from("businesses").update({ featured }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-businesses"] });
      toast.success("Destaque atualizado");
    },
  });

  const updateBusiness = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase.from("businesses").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-businesses"] });
      setEditBiz(null);
      toast.success("Empresa atualizada");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteBusiness = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("availability").delete().eq("business_id", id);
      await supabase.from("bookings").delete().eq("business_id", id);
      await supabase.from("professional_services").delete().in(
        "professional_id",
        (await supabase.from("professionals").select("id").eq("business_id", id)).data?.map(p => p.id) || []
      );
      await supabase.from("professionals").delete().eq("business_id", id);
      await supabase.from("services").delete().eq("business_id", id);
      const { error } = await supabase.from("businesses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-businesses"] });
      toast.success("Empresa removida");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const createBusiness = useMutation({
    mutationFn: async ({ form, ownerId }: { form: typeof emptyBizForm; ownerId?: string }) => {
      if (!form.name.trim() || !form.slug.trim()) throw new Error("Nome e slug são obrigatórios");
      const stateName = states.find(s => s.code === form.state)?.name || form.state;
      const { error } = await supabase.from("businesses").insert({
        name: form.name.trim(),
        slug: form.slug.trim(),
        category: form.category,
        state: stateName,
        city: form.city,
        neighborhood: form.neighborhood,
        phone: form.phone,
        description: form.description,
        owner_id: ownerId || user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-businesses"] });
      setShowNewBiz(false);
      setBizForm(emptyBizForm);
      setOwnerLookup(null);
      setOwnerLookupError("");
      toast.success("Empresa criada com sucesso!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const lookupOwner = async (email: string) => {
    if (!email.trim()) { setOwnerLookup(null); setOwnerLookupError(""); return; }
    setLookingUpOwner(true);
    setOwnerLookupError("");
    setOwnerLookup(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lookup-user-by-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao buscar usuário");
      setOwnerLookup(json);
    } catch (err: any) {
      setOwnerLookupError(err.message);
    } finally {
      setLookingUpOwner(false);
    }
  };

  const openEditBiz = (biz: any) => {
    setEditBiz(biz);
    const stateKey = states.find(s => s.name === biz.state)?.code || biz.state || "";
    setBizForm({
      name: biz.name || "",
      slug: biz.slug || "",
      category: biz.category || "beleza",
      state: stateKey,
      city: biz.city || "",
      neighborhood: biz.neighborhood || "",
      phone: biz.phone || "",
      description: biz.description || "",
      ownerEmail: "",
    });
    setOwnerLookup(null);
    setOwnerLookupError("");
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Empresas Cadastradas ({businesses.length})
          </CardTitle>
          <Button
            size="sm"
            className="gradient-primary text-primary-foreground"
            onClick={() => { setBizForm(emptyBizForm); setShowNewBiz(true); }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Nova Empresa
          </Button>
        </CardHeader>
        <CardContent>
          {businesses.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhuma empresa cadastrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Destaque</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead className="w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businesses.map((biz) => (
                  <TableRow key={biz.id}>
                    <TableCell>
                      <Switch
                        checked={biz.featured}
                        onCheckedChange={(featured) => toggleFeatured.mutate({ id: biz.id, featured })}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{biz.name}</span>
                        {biz.featured && (
                          <Badge className="gradient-accent text-accent-foreground text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Destaque
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">/{biz.slug}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{biz.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{biz.city || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditBiz(biz)} title="Editar">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Ver página">
                          <a href={`/${biz.slug}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm(`Remover "${biz.name}"? Todos os dados serão perdidos.`)) {
                              deleteBusiness.mutate(biz.id);
                            }
                          }}
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Business Dialog */}
      <Dialog open={!!editBiz} onOpenChange={(open) => !open && setEditBiz(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={bizForm.name} onChange={(e) => setBizForm({ ...bizForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input value={bizForm.slug} onChange={(e) => setBizForm({ ...bizForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={bizForm.category} onValueChange={(v) => setBizForm({ ...bizForm, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={bizForm.state} onValueChange={(v) => setBizForm({ ...bizForm, state: v, city: "", neighborhood: "" })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {states.map((s) => (
                    <SelectItem key={s.code} value={s.code}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cidade</Label>
              <Select value={bizForm.city} onValueChange={(v) => {
                const sk = findStateByCity(v);
                setBizForm({ ...bizForm, city: v, neighborhood: "", state: sk || bizForm.state });
              }}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {(bizForm.state ? getCities(bizForm.state) : getAllCitiesWithState().map(c => c.city)).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bairro</Label>
              <Select value={bizForm.neighborhood} onValueChange={(v) => setBizForm({ ...bizForm, neighborhood: v })} disabled={!bizForm.city}>
                <SelectTrigger><SelectValue placeholder={bizForm.city ? "Selecione" : "Escolha a cidade"} /></SelectTrigger>
                <SelectContent>
                  {getNeighborhoods(bizForm.city, bizForm.state).map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={bizForm.phone} onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input value={bizForm.description} onChange={(e) => setBizForm({ ...bizForm, description: e.target.value })} />
            </div>
            <Button
              className="w-full gradient-primary text-primary-foreground"
              onClick={() => {
                if (!editBiz) return;
                const { ownerEmail, state, ...rest } = bizForm;
                const stateName = states.find(s => s.code === state)?.name || state;
                updateBusiness.mutate({ id: editBiz.id, updates: { ...rest, state: stateName } });
              }}
              disabled={updateBusiness.isPending}
            >
              {updateBusiness.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Business Dialog */}
      <Dialog open={showNewBiz} onOpenChange={setShowNewBiz}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Empresa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input value={bizForm.name} onChange={(e) => {
                const name = e.target.value;
                const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                setBizForm({ ...bizForm, name, slug });
              }} placeholder="Nome da empresa" />
            </div>
            <div>
              <Label>Slug (URL) *</Label>
              <Input value={bizForm.slug} onChange={(e) => setBizForm({ ...bizForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} placeholder="minha-empresa" />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={bizForm.category} onValueChange={(v) => setBizForm({ ...bizForm, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={bizForm.state} onValueChange={(v) => setBizForm({ ...bizForm, state: v, city: "", neighborhood: "" })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {states.map((s) => (
                    <SelectItem key={s.code} value={s.code}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cidade</Label>
              <Select value={bizForm.city} onValueChange={(v) => {
                const sk = findStateByCity(v);
                setBizForm({ ...bizForm, city: v, neighborhood: "", state: sk || bizForm.state });
              }}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {(bizForm.state ? getCities(bizForm.state) : getAllCitiesWithState().map(c => c.city)).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bairro</Label>
              <Select value={bizForm.neighborhood} onValueChange={(v) => setBizForm({ ...bizForm, neighborhood: v })} disabled={!bizForm.city}>
                <SelectTrigger><SelectValue placeholder={bizForm.city ? "Selecione" : "Escolha a cidade"} /></SelectTrigger>
                <SelectContent>
                  {getNeighborhoods(bizForm.city, bizForm.state).map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={bizForm.phone} onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={bizForm.description} onChange={(e) => setBizForm({ ...bizForm, description: e.target.value })} placeholder="Descrição da empresa" />
            </div>
            <div>
              <Label>Proprietário (email do usuário)</Label>
              <div className="flex gap-2">
                <Input
                  value={bizForm.ownerEmail}
                  onChange={(e) => { setBizForm({ ...bizForm, ownerEmail: e.target.value }); setOwnerLookup(null); setOwnerLookupError(""); }}
                  placeholder="email@exemplo.com (opcional)"
                  type="email"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => lookupOwner(bizForm.ownerEmail)}
                  disabled={lookingUpOwner || !bizForm.ownerEmail.trim()}
                >
                  {lookingUpOwner ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
                </Button>
              </div>
              {ownerLookup && (
                <p className="text-xs text-primary mt-1 font-medium">✓ Usuário encontrado: {ownerLookup.email}</p>
              )}
              {ownerLookupError && (
                <p className="text-xs text-destructive mt-1">{ownerLookupError}</p>
              )}
              {!bizForm.ownerEmail.trim() && (
                <p className="text-xs text-muted-foreground mt-1">Se vazio, será atribuído ao seu usuário admin.</p>
              )}
            </div>
            <Button
              className="w-full gradient-primary text-primary-foreground"
              onClick={() => createBusiness.mutate({ form: bizForm, ownerId: ownerLookup?.id })}
              disabled={createBusiness.isPending || !bizForm.name.trim() || !bizForm.slug.trim() || (!!bizForm.ownerEmail.trim() && !ownerLookup)}
            >
              {createBusiness.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Criar Empresa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
