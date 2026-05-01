import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Plus, Trash2, ImagePlus, Globe, Lock, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

type Testimonial = { name: string; text: string };

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function BusinessSiteTab() {
  const { business, refetch } = useMyBusiness();
  const { subscription, loading: subLoading } = useSubscription();
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

    // Valida tipo e tamanho antes de subir nada
    const invalid: string[] = [];
    const valid: File[] = [];
    for (const f of files) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        invalid.push(`${f.name} (formato não suportado — use JPG, PNG ou WEBP)`);
      } else if (f.size > MAX_FILE_SIZE) {
        invalid.push(`${f.name} (acima de ${MAX_FILE_SIZE_MB}MB)`);
      } else {
        valid.push(f);
      }
    }
    if (invalid.length) {
      toast.error(`${invalid.length} arquivo(s) ignorados:\n${invalid.join("\n")}`);
    }
    if (!valid.length) {
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];
    const failures: string[] = [];

    for (const file of valid) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      // Path obrigatoriamente prefixado por business.id (RLS de business-assets exige isso)
      const path = `${business.id}/site/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("business-assets")
        .upload(path, file, { contentType: file.type });
      if (error) {
        failures.push(`${file.name}: ${error.message}`);
        continue;
      }
      const { data } = supabase.storage.from("business-assets").getPublicUrl(path);
      uploadedUrls.push(data.publicUrl);
    }

    setUploading(false);
    if (galleryInputRef.current) galleryInputRef.current.value = "";

    if (uploadedUrls.length) {
      // Persiste imediatamente para não perder fotos se o usuário esquecer de "Salvar mini-site"
      const newGallery = [...form.site_gallery, ...uploadedUrls];
      setForm((f) => ({ ...f, site_gallery: newGallery }));
      try {
        const { error } = await supabase
          .from("businesses")
          .update({ site_gallery: newGallery as any })
          .eq("id", business.id);
        if (error) throw error;
        refetch();
        toast.success(`${uploadedUrls.length} imagem(ns) adicionada(s)`);
      } catch (err: any) {
        toast.error("Imagens enviadas mas não foi possível salvar: " + err.message);
      }
    }
    if (failures.length) {
      toast.error(`Falha em ${failures.length} arquivo(s):\n${failures.join("\n")}`);
    }
  };

  // Remove de storage best-effort. Se falhar (orphan), só removemos da galeria.
  const removeGalleryImage = async (url: string) => {
    if (!business) return;
    const newGallery = form.site_gallery.filter((u) => u !== url);
    setForm((f) => ({ ...f, site_gallery: newGallery }));
    try {
      await supabase.from("businesses").update({ site_gallery: newGallery as any }).eq("id", business.id);
      refetch();
    } catch (err: any) {
      toast.error("Erro ao salvar: " + err.message);
      return;
    }
    // Best-effort: tenta remover do storage usando o path derivado da URL
    const match = url.match(/\/business-assets\/(.+)$/);
    if (match) {
      await supabase.storage.from("business-assets").remove([match[1]]).catch(() => {});
    }
  };

  if (!business) {
    return <p className="text-muted-foreground text-center py-12">Crie sua empresa primeiro na aba "Minha Empresa".</p>;
  }

  // Gate: mini-site requer plano pago
  if (subLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!subscription?.subscribed) {
    return (
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            Mini-site disponível em planos pagos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-xl bg-muted/50 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Transforme sua página em um mini-site completo</h3>
                <p className="text-sm text-muted-foreground">
                  Com um plano pago você desbloqueia: título e subtítulo personalizados,
                  galeria de fotos, depoimentos de clientes, lista de diferenciais, links
                  de WhatsApp e Instagram, e botão de chamada para ação.
                </p>
              </div>
            </div>
          </div>
          <ul className="text-sm space-y-2 text-foreground/80 pl-1">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Galeria de fotos do seu espaço</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Depoimentos de clientes em destaque</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Texto "sobre" estendido com história do negócio</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Botão de WhatsApp e Instagram direto na página</li>
          </ul>
          <Link to="/planos" className="block">
            <Button size="lg" className="w-full gradient-primary text-primary-foreground shadow-glow">
              Ver planos e contratar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
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
          <div>
            <CardTitle>Galeria de Fotos</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG ou WEBP — máx. {MAX_FILE_SIZE_MB}MB por imagem
            </p>
          </div>
          <Button size="sm" onClick={() => galleryInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ImagePlus className="w-4 h-4 mr-1" />}
            Adicionar fotos
          </Button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
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
                    onClick={() => removeGalleryImage(url)}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    title="Remover imagem"
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