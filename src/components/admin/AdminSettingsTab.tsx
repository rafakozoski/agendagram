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
import { Plus, Trash2, Star, Loader2, Settings, Store, Edit, Eye } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function AdminSettingsTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newCatName, setNewCatName] = useState("");
  const [editBiz, setEditBiz] = useState<any>(null);
  const [showNewBiz, setShowNewBiz] = useState(false);
  const emptyBizForm = { name: "", slug: "", category: "beleza", city: "", neighborhood: "", phone: "", description: "" };
  const [bizForm, setBizForm] = useState(emptyBizForm);

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: businesses = [], isLoading: bizLoading } = useQuery({
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
      // Delete related data first
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
    mutationFn: async (form: typeof emptyBizForm) => {
      if (!form.name.trim() || !form.slug.trim()) throw new Error("Nome e slug são obrigatórios");
      const { error } = await supabase.from("businesses").insert({
        name: form.name.trim(),
        slug: form.slug.trim(),
        category: form.category,
        city: form.city,
        neighborhood: form.neighborhood,
        phone: form.phone,
        description: form.description,
        owner_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-businesses"] });
      setShowNewBiz(false);
      setBizForm(emptyBizForm);
      toast.success("Empresa criada com sucesso!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const addCategory = useMutation({
    mutationFn: async (name: string) => {
      const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
      const { error } = await supabase.from("categories").insert({ name, slug, sort_order: categories.length + 1 });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setNewCatName("");
      toast.success("Categoria adicionada");
    },
  });

  const toggleCategory = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase.from("categories").update({ enabled }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria atualizada");
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria removida");
    },
  });

  const openEditBiz = (biz: any) => {
    setEditBiz(biz);
    setBizForm({
      name: biz.name || "",
      slug: biz.slug || "",
      category: biz.category || "beleza",
      city: biz.city || "",
      neighborhood: biz.neighborhood || "",
      phone: biz.phone || "",
      description: biz.description || "",
    });
  };

  if (catLoading || bizLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Categories Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Categorias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 p-3 rounded-lg border">
              <Switch
                checked={cat.enabled}
                onCheckedChange={(enabled) => toggleCategory.mutate({ id: cat.id, enabled })}
              />
              <span className={`font-medium flex-1 ${!cat.enabled ? "text-muted-foreground line-through" : ""}`}>
                {cat.name}
              </span>
              <Badge variant="outline" className="text-xs">{cat.slug}</Badge>
              <Button variant="ghost" size="icon" onClick={() => deleteCategory.mutate(cat.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Input
              placeholder="Nova categoria..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && newCatName.trim() && addCategory.mutate(newCatName.trim())}
            />
            <Button
              onClick={() => newCatName.trim() && addCategory.mutate(newCatName.trim())}
              size="sm"
              className="gradient-primary text-primary-foreground shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Business Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Empresas Cadastradas ({businesses.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {businesses.map((biz) => (
            <div key={biz.id} className="flex items-center gap-3 p-3 rounded-lg border">
              <Switch
                checked={biz.featured}
                onCheckedChange={(featured) => toggleFeatured.mutate({ id: biz.id, featured })}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{biz.name}</span>
                  {biz.featured && (
                    <Badge className="gradient-accent text-accent-foreground text-xs shrink-0">
                      <Star className="w-3 h-3 mr-1" />
                      Destaque
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span>/{biz.slug}</span>
                  {biz.city && <span>• {biz.city}</span>}
                  {biz.neighborhood && <span>• {biz.neighborhood}</span>}
                  <Badge variant="outline" className="text-xs">{biz.category}</Badge>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
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
            </div>
          ))}
          {businesses.length === 0 && (
            <p className="text-muted-foreground text-center py-4">Nenhuma empresa cadastrada.</p>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Cidade</Label>
                <Input value={bizForm.city} onChange={(e) => setBizForm({ ...bizForm, city: e.target.value })} />
              </div>
              <div>
                <Label>Bairro</Label>
                <Input value={bizForm.neighborhood} onChange={(e) => setBizForm({ ...bizForm, neighborhood: e.target.value })} />
              </div>
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
              onClick={() => editBiz && updateBusiness.mutate({ id: editBiz.id, updates: bizForm })}
              disabled={updateBusiness.isPending}
            >
              {updateBusiness.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
