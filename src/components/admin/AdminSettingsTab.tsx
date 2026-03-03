import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Star, Loader2, Settings } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function AdminSettingsTab() {
  const queryClient = useQueryClient();
  const [newCatName, setNewCatName] = useState("");

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

      {/* Featured Businesses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Empresas em Destaque
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {businesses.map((biz) => (
            <div key={biz.id} className="flex items-center gap-3 p-3 rounded-lg border">
              <Switch
                checked={biz.featured}
                onCheckedChange={(featured) => toggleFeatured.mutate({ id: biz.id, featured })}
              />
              <div className="flex-1">
                <span className="font-medium">{biz.name}</span>
                <span className="text-sm text-muted-foreground ml-2">/{biz.slug}</span>
              </div>
              {biz.featured && (
                <Badge className="gradient-accent text-accent-foreground text-xs">Destaque</Badge>
              )}
            </div>
          ))}
          {businesses.length === 0 && (
            <p className="text-muted-foreground text-center py-4">Nenhuma empresa cadastrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
