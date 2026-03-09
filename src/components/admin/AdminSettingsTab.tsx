import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, Settings, Edit } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function AdminSettingsTab() {
  const queryClient = useQueryClient();
  const [newCatName, setNewCatName] = useState("");
  const [editCat, setEditCat] = useState<any>(null);
  const [catForm, setCatForm] = useState({ name: "", slug: "" });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
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

  const updateCategory = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { name: string; slug: string } }) => {
      const { error } = await supabase.from("categories").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditCat(null);
      toast.success("Categoria salva");
    },
    onError: (err: any) => toast.error(err.message),
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

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
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
                checked={cat.enabled ?? true}
                onCheckedChange={(enabled) => toggleCategory.mutate({ id: cat.id, enabled })}
              />
              <span className={`font-medium flex-1 ${!cat.enabled ? "text-muted-foreground line-through" : ""}`}>
                {cat.name}
              </span>
              <Badge variant="outline" className="text-xs">{cat.slug}</Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setEditCat(cat); setCatForm({ name: cat.name, slug: cat.slug }); }}
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => deleteCategory.mutate(cat.id)} title="Remover">
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

      <Dialog open={!!editCat} onOpenChange={(open) => !open && setEditCat(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input
                value={catForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "");
                  setCatForm({ name, slug });
                }}
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={catForm.slug}
                onChange={(e) => setCatForm({ ...catForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
              />
            </div>
            <Button
              className="w-full gradient-primary text-primary-foreground"
              onClick={() => editCat && updateCategory.mutate({ id: editCat.id, updates: catForm })}
              disabled={updateCategory.isPending || !catForm.name.trim() || !catForm.slug.trim()}
            >
              {updateCategory.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar Categoria
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
