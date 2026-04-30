import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Trash2, Plus, Image, ExternalLink, Pencil, Check, X } from "lucide-react";

export function BannersTab() {
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [position, setPosition] = useState("top");
  const [halfHeight, setHalfHeight] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ image_url: string; link_url: string; position: string; half_height: boolean }>({
    image_url: "", link_url: "", position: "top", half_height: false,
  });

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `banners/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("business-assets").upload(path, file);
    if (error) {
      toast({ title: "Erro ao enviar imagem", variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: pub } = supabase.storage.from("business-assets").getPublicUrl(path);
    setImageUrl(pub.publicUrl);
    setUploading(false);
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!imageUrl) throw new Error("Imagem obrigatória");
      const { error } = await supabase.from("banners").insert({
        image_url: imageUrl,
        link_url: linkUrl,
        position,
        half_height: halfHeight,
        sort_order: banners.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setImageUrl("");
      setLinkUrl("");
      setHalfHeight(false);
      toast({ title: "Banner adicionado!" });
    },
    onError: () => toast({ title: "Erro ao adicionar", variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase.from("banners").update({ enabled }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "Banner removido" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase.from("banners").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setEditingId(null);
      toast({ title: "Banner atualizado" });
    },
    onError: () => toast({ title: "Erro ao atualizar", variant: "destructive" }),
  });

  const handleEditUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop();
    const path = `banners/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("business-assets").upload(path, file);
    if (error) {
      toast({ title: "Erro ao enviar imagem", variant: "destructive" });
      return;
    }
    const { data: pub } = supabase.storage.from("business-assets").getPublicUrl(path);
    setEditForm((f) => ({ ...f, image_url: pub.publicUrl }));
  };

  const startEdit = (b: any) => {
    setEditingId(b.id);
    setEditForm({
      image_url: b.image_url || "",
      link_url: b.link_url || "",
      position: b.position || "top",
      half_height: !!b.half_height,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Adicionar Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Tamanho recomendado: <strong>1920×500 px</strong> (normal) ou <strong>1920×250 px</strong> (50%). Formato JPG/PNG/WebP, até 2MB.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Imagem do Banner</Label>
              <Input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
              <span className="text-xs text-muted-foreground">ou cole a URL da imagem:</span>
              <Input
                placeholder="https://exemplo.com/imagem.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              {imageUrl && (
                <img src={imageUrl} alt="Preview" className="h-24 rounded-lg object-cover w-full" />
              )}
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Link (opcional)</Label>
                <Input
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Posição</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Acima dos Destaques</SelectItem>
                    <SelectItem value="middle">Acima dos Estabelecimentos</SelectItem>
                    <SelectItem value="bottom">Final da Página</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label>Altura reduzida (50%)</Label>
                  <p className="text-xs text-muted-foreground">Use para banners mais discretos</p>
                </div>
                <Switch checked={halfHeight} onCheckedChange={setHalfHeight} />
              </div>
            </div>
          </div>
          <Button onClick={() => addMutation.mutate()} disabled={!imageUrl || addMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Banner
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Banners Cadastrados ({banners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : banners.length === 0 ? (
            <p className="text-muted-foreground">Nenhum banner cadastrado.</p>
          ) : (
            <div className="space-y-4">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="p-3 rounded-lg border bg-card"
                >
                  {editingId === banner.id ? (
                    <div className="space-y-3">
                      <div className="flex gap-3 items-start">
                        {editForm.image_url && (
                          <img src={editForm.image_url} alt="Preview" className="h-20 w-32 object-cover rounded-md shrink-0" />
                        )}
                        <div className="flex-1 space-y-2">
                          <Input type="file" accept="image/*" onChange={handleEditUpload} />
                          <Input
                            placeholder="ou cole URL da imagem"
                            value={editForm.image_url}
                            onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Link</Label>
                          <Input
                            value={editForm.link_url}
                            onChange={(e) => setEditForm({ ...editForm, link_url: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Posição</Label>
                          <Select value={editForm.position} onValueChange={(v) => setEditForm({ ...editForm, position: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="top">Acima dos Destaques</SelectItem>
                              <SelectItem value="middle">Acima dos Estabelecimentos</SelectItem>
                              <SelectItem value="bottom">Final da Página</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-md border">
                        <Label className="text-sm">Altura reduzida (50%)</Label>
                        <Switch
                          checked={editForm.half_height}
                          onCheckedChange={(v) => setEditForm({ ...editForm, half_height: v })}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4 mr-1" /> Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateMutation.mutate({ id: banner.id, updates: editForm })}
                          disabled={!editForm.image_url || updateMutation.isPending}
                        >
                          <Check className="w-4 h-4 mr-1" /> Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <img
                        src={banner.image_url}
                        alt="Banner"
                        className={`${banner.half_height ? "h-10" : "h-16"} w-28 object-cover rounded-md shrink-0`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {banner.position === "top" ? "Acima dos Destaques" : banner.position === "middle" ? "Acima dos Estabelecimentos" : "Final da Página"}
                          {banner.half_height && <span className="ml-2 text-xs text-muted-foreground">(50%)</span>}
                        </p>
                        {banner.link_url && (
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            {banner.link_url}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Switch
                          checked={banner.enabled}
                          onCheckedChange={(enabled) =>
                            toggleMutation.mutate({ id: banner.id, enabled })
                          }
                        />
                        <Button size="icon" variant="ghost" onClick={() => startEdit(banner)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(banner.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
