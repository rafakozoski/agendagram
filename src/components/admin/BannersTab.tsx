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
import { Trash2, Plus, Image, ExternalLink } from "lucide-react";

export function BannersTab() {
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [position, setPosition] = useState("top");
  const [uploading, setUploading] = useState(false);

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
        sort_order: banners.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setImageUrl("");
      setLinkUrl("");
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
                    <SelectItem value="bottom">Final da Página (50% altura)</SelectItem>
                  </SelectContent>
                </Select>
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
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card"
                >
                  <img
                    src={banner.image_url}
                    alt="Banner"
                    className="h-16 w-28 object-cover rounded-md shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {banner.position === "top" ? "Acima dos Destaques" : banner.position === "middle" ? "Acima dos Estabelecimentos" : "Final da Página (50%)"}
                    </p>
                    {banner.link_url && (
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        {banner.link_url}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Switch
                      checked={banner.enabled}
                      onCheckedChange={(enabled) =>
                        toggleMutation.mutate({ id: banner.id, enabled })
                      }
                    />
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
