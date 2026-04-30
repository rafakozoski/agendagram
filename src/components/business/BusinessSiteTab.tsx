import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Plus, Trash2, ImagePlus, Globe } from "lucide-react";
import { toast } from "sonner";

type Testimonial = { name: string; text: string };

export function BusinessSiteTab() {
  const { user } = useAuth();
  const { business, refetch } = useMyBusiness();
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    site_enabled: false,
    site_headline: "",
    site_subheadline: "",
    site_about: "",
    site_cta_label: "",
    site_instagram: "",
    site_whatsapp: "",
    site_gallery: [] as string[],
    site_features: [] as string[],
    site_testimonials: [] as Testimonial[],
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!business) return;
    const b = business as any;
    setForm({
      site_enabled: !!b.site_enabled,
      site_headline: b.site_headline || "",
      site_subheadline: b.site_subheadline || "",
      site_about: b.site_about || "",
      site_cta_label: b.site_cta_label || "",
      site_instagram: b.site_instagram || "",
      site_whatsapp: b.site_whatsapp || "",
      site_gallery: Array.isArray(b.site_gallery) ? b.site_gallery : [],
      site_features: Array.isArray(b.site_features) ? b.site_features : [],
      site_testimonials: Array.isArray(b.site_testimonials) ? b.site_testimonials : [],
    });
  }, [business]);

  const save = useMutation({
    mutationFn: async () => {
      if (!business) return;
      const { error } = await supabase.from("businesses").update(form as any).eq("id", business.id);
      if (error) throw error;
    },
    onSuccess: () => { refetch(); toast.success("Mini-site atualizado!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !business) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `site/${user!.id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("business-assets").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("business-assets").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      setForm((f) => ({ ...f, site_gallery: [...f.site_gallery, ...urls] }));
      toast.success(`${urls.length} imagem(ns) adicionada(s)`);
    } catch (err: any) {
      toast.error("Erro ao enviar: " + err.message);
    } finally {
      setUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  if (!business) {
    return <p className="text-muted-foreground text-center py-12">Crie sua empresa primeiro na aba "Minha Empresa".</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" /> Mini-site do Negócio
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Conteúdo extra exibido abaixo do agendamento na sua página pública. Funciona como um site editável.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label>Mini-site ativo</Label>
              <p className="text-xs text-muted-foreground">Mostrar essa seção na página pública</p>
            </div>
            <Switch checked={form.site_enabled} onCheckedChange={(v) => setForm({ ...form, site_enabled: v })} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Título principal</Label>
              <Input
                value={form.site_headline}
                onChange={(e) => setForm({ ...form, site_headline: e.target.value })}
                placeholder="Bem-vindo ao nosso espaço"
              />
            </div>
            <div>
              <Label>Subtítulo</Label>
              <Input
                value={form.site_subheadline}
                onChange={(e) => setForm({ ...form, site_subheadline: e.target.value })}
                placeholder="Cuidado, qualidade e atendimento"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Sobre / Descrição longa</Label>
              <Textarea
                value={form.site_about}
                onChange={(e) => setForm({ ...form, site_about: e.target.value })}
                rows={5}
                placeholder="Conte a história do seu negócio..."
              />
            </div>
            <div>
              <Label>Texto do botão (CTA)</Label>
              <Input
                value={form.site_cta_label}
                onChange={(e) => setForm({ ...form, site_cta_label: e.target.value })}
                placeholder="Agendar agora"
              />
            </div>
            <div>
              <Label>Instagram (sem @)</Label>
              <Input
                value={form.site_instagram}
                onChange={(e) => setForm({ ...form, site_instagram: e.target.value })}
                placeholder="meu_negocio"
              />
            </div>
            <div>
              <Label>WhatsApp (com DDD)</Label>
              <Input
                value={form.site_whatsapp}
                onChange={(e) => setForm({ ...form, site_whatsapp: e.target.value })}
                placeholder="11999999999"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diferenciais */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Diferenciais</CardTitle>
          <Button size="sm" onClick={() => setForm({ ...form, site_features: [...form.site_features, ""] })}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {form.site_features.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-3">Nenhum diferencial cadastrado.</p>
          )}
          {form.site_features.map((f, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={f}
                onChange={(e) => {
                  const next = [...form.site_features];
                  next[i] = e.target.value;
                  setForm({ ...form, site_features: next });
                }}
                placeholder="Ex: Profissionais certificados"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setForm({ ...form, site_features: form.site_features.filter((_, idx) => idx !== i) })}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Galeria */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Galeria de Fotos</CardTitle>
          <Button size="sm" onClick={() => galleryInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ImagePlus className="w-4 h-4 mr-1" />}
            Adicionar fotos
          </Button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleGalleryUpload}
          />
        </CardHeader>
        <CardContent>
          {form.site_gallery.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">Nenhuma foto adicionada.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {form.site_gallery.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt={`Galeria ${i}`} className="w-full h-32 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, site_gallery: form.site_gallery.filter((_, idx) => idx !== i) })}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Depoimentos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Depoimentos</CardTitle>
          <Button
            size="sm"
            onClick={() => setForm({ ...form, site_testimonials: [...form.site_testimonials, { name: "", text: "" }] })}
          >
            <Plus className="w-4 h-4 mr-1" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.site_testimonials.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-3">Nenhum depoimento.</p>
          )}
          {form.site_testimonials.map((t, i) => (
            <div key={i} className="grid md:grid-cols-3 gap-2 items-start p-3 border rounded-lg">
              <Input
                placeholder="Nome do cliente"
                value={t.name}
                onChange={(e) => {
                  const next = [...form.site_testimonials];
                  next[i] = { ...next[i], name: e.target.value };
                  setForm({ ...form, site_testimonials: next });
                }}
              />
              <Textarea
                className="md:col-span-2"
                placeholder="Depoimento..."
                rows={2}
                value={t.text}
                onChange={(e) => {
                  const next = [...form.site_testimonials];
                  next[i] = { ...next[i], text: e.target.value };
                  setForm({ ...form, site_testimonials: next });
                }}
              />
              <div className="md:col-span-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setForm({ ...form, site_testimonials: form.site_testimonials.filter((_, idx) => idx !== i) })}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => save.mutate()} className="gradient-primary text-primary-foreground">
          {save.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar mini-site
        </Button>
      </div>
    </div>
  );
}