import { useState, useEffect, useRef } from "react";
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
import { Plus, Trash2, Save, Loader2, Store, Users, Package, Clock, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

// ─── Lista de estados e cidades brasileiras ───────────────────────────────────
const ESTADOS: Record<string, { nome: string; cidades: Record<string, string[]> }> = {
  AC: { nome: "Acre", cidades: { "Rio Branco": ["Centro", "Bosque", "Cadeia Velha", "Conquista", "Floresta", "Habitasa", "Jardim Primavera", "Novo Horizonte", "Preventório", "São Francisco"] } },
  AL: { nome: "Alagoas", cidades: { "Maceió": ["Centro", "Farol", "Jatiúca", "Ponta Verde", "Pajuçara", "Mangabeiras", "Tabuleiro do Martins", "Benedito Bentes"], "Arapiraca": ["Centro", "Brasília", "Cacimbas", "Gordura", "São Pedro"] } },
  AP: { nome: "Amapá", cidades: { "Macapá": ["Centro", "Buritizal", "Congós", "Jesus de Nazaré", "Novo Horizonte", "Santa Rita", "Trem"] } },
  AM: { nome: "Amazonas", cidades: { "Manaus": ["Centro", "Adrianópolis", "Aleixo", "Alvorada", "Armando Mendes", "Chapada", "Cidade Nova", "Dom Pedro", "Flores", "Japiim", "Parque 10 de Novembro", "Petrópolis", "São Geraldo", "Vieiralves"] } },
  BA: { nome: "Bahia", cidades: { "Salvador": ["Barra", "Brotas", "Cabula", "Campo Grande", "Centro", "Cidade Baixa", "Federação", "Graça", "Itaigara", "Liberdade", "Nazaré", "Ondina", "Pituba", "Rio Vermelho", "Tororó", "Vitória"], "Feira de Santana": ["Centro", "Brasília", "Caseb", "Cidade Nova", "Conceição", "Kalilândia", "Papagaio", "Pampalona"] } },
  CE: { nome: "Ceará", cidades: { "Fortaleza": ["Aldeota", "Benfica", "Centro", "Cidade dos Funcionários", "Cocó", "Damas", "Dionísio Torres", "Fátima", "Guararapes", "Joaquim Távora", "Meireles", "Messejana", "Montese", "Mucuripe", "Parquelândia", "Parangaba", "Patriolino Ribeiro", "Varjota"], "Caucaia": ["Centro", "Araturi", "Jurema", "Parque Tabapuã", "Tucunduba"] } },
  DF: { nome: "Distrito Federal", cidades: { "Brasília": ["Asa Norte", "Asa Sul", "Cruzeiro", "Guará", "Lago Norte", "Lago Sul", "Noroeste", "Núcleo Bandeirante", "Park Way", "Samambaia", "Santa Maria", "Sobradinho", "Sudoeste", "Taguatinga"] } },
  ES: { nome: "Espírito Santo", cidades: { "Vitória": ["Centro", "Bento Ferreira", "Bonfim", "Goiabeiras", "Jardim Camburi", "Jardim da Penha", "Mata da Praia", "Praia do Canto", "Santa Luíza", "Santa Lúcia", "Santo Antônio"], "Vila Velha": ["Centro", "Coqueiral de Itaparica", "Itaparica", "Praia das Gaivotas", "Terra Vermelha"] } },
  GO: { nome: "Goiás", cidades: { "Goiânia": ["Centro", "Aldeota", "Bueno", "Campinas", "Cidade Jardim", "Goiânia 2", "Jardim América", "Jardim Goiás", "Marista", "Oeste", "Setor Sul", "Setor Universitário"], "Aparecida de Goiânia": ["Centro", "Andrade", "Bairro Cardoso", "Independência", "Papillon"] } },
  MA: { nome: "Maranhão", cidades: { "São Luís": ["Centro", "Anil", "Calhau", "Cohab", "Cohama", "Jaracaty", "João Paulo", "Olho D'Água", "Renascença", "São Francisco"] } },
  MT: { nome: "Mato Grosso", cidades: { "Cuiabá": ["Centro", "Araés", "Bandeirantes", "Bosque da Saúde", "Cidade Alta", "Coophema", "CPA", "Duque de Caxias", "Goiabeiras", "Jardim das Américas", "Pedra 90"] } },
  MS: { nome: "Mato Grosso do Sul", cidades: { "Campo Grande": ["Centro", "Autonomista", "Carandá Bosque", "Chácara Cachoeira", "Coronel Antonino", "Itanhangá", "Jardim dos Estados", "Monte Castelo", "Nova Lima", "Pioneiros"] } },
  MG: { nome: "Minas Gerais", cidades: { "Belo Horizonte": ["Barreiro", "Betânia", "Buritis", "Centro", "Cidade Nova", "Colégio Batista", "Contorno", "Floresta", "Funcionários", "Gutierrez", "Lourdes", "Luxemburgo", "Mangabeiras", "Padre Eustáquio", "Pampulha", "Sagrada Família", "Santa Efigênia", "Savassi", "Serra", "União"], "Uberlândia": ["Centro", "Aparecida", "Custódio Pereira", "Jardim Karaíba", "Martins", "Marta Helena", "Osvaldo Rezende", "Santa Mônica", "Tibery"] } },
  PA: { nome: "Pará", cidades: { "Belém": ["Centro", "Batista Campos", "Campina", "Cidade Velha", "Guamá", "Marco", "Nazaré", "Pedreira", "Sacramenta", "Souza", "Umarizal"] } },
  PB: { nome: "Paraíba", cidades: { "João Pessoa": ["Centro", "Altiplano", "Bessa", "Cabo Branco", "Castelo Branco", "Cristo Redentor", "Expedicionários", "Jardim Oceania", "Miramar", "Tambaú", "Tambiá", "Torre"] } },
  PR: { nome: "Paraná", cidades: { "Curitiba": ["Água Verde", "Alto da Glória", "Bacacheri", "Batel", "Boa Vista", "Boqueirão", "Cajuru", "Centro", "Centro Cívico", "CIC", "Hauer", "Jardim Social", "Juvevê", "Mercês", "Portão", "Rebouças", "Santa Felicidade", "Seminário", "Uberaba", "Xaxim"], "Londrina": ["Centro", "Cambezinho", "Gleba Palhano", "Jardins", "Palhano", "Petrópolis", "Shangri-lá"] } },
  PE: { nome: "Pernambuco", cidades: { "Recife": ["Aflitos", "Boa Viagem", "Boa Vista", "Bom Jesus", "Cabanga", "Casa Forte", "Centro", "Derby", "Espinheiro", "Graças", "Ilha do Retiro", "Ilha Joana Bezerra", "Ipsep", "Madalena", "Pina", "Santo Amaro", "Setúbal", "Tamarineira", "Zumbi"], "Caruaru": ["Centro", "Maurício de Nassau", "Rendeiras", "Roosevelt", "São Francisco"] } },
  PI: { nome: "Piauí", cidades: { "Teresina": ["Centro", "Fátima", "Ilhotas", "Ininga", "Jóquei", "Leste", "Mocambinho", "Norte", "Noivos", "São Cristóvão"] } },
  RJ: { nome: "Rio de Janeiro", cidades: { "Rio de Janeiro": ["Barra da Tijuca", "Botafogo", "Centro", "Copacabana", "Flamengo", "Gávea", "Humaitá", "Ipanema", "Jacarepaguá", "Laranjeiras", "Leblon", "Leme", "Madureira", "Méier", "Recreio dos Bandeirantes", "Santa Teresa", "São Conrado", "Tijuca", "Urca", "Vila Isabel"], "Niterói": ["Centro", "Fonseca", "Icaraí", "Ingá", "Piratininga", "São Francisco"] } },
  RN: { nome: "Rio Grande do Norte", cidades: { "Natal": ["Alecrim", "Barro Vermelho", "Capim Macio", "Centro", "Cidade Alta", "Lagoa Nova", "Petrópolis", "Ponta Negra", "Tirol"] } },
  RS: { nome: "Rio Grande do Sul", cidades: { "Porto Alegre": ["Auxiliadora", "Bela Vista", "Bom Fim", "Centro", "Cidade Baixa", "Floresta", "Boa Vista", "Jardim Lindóia", "Menino Deus", "Moinhos de Vento", "Mont'Serrat", "Petrópolis", "Praia de Belas", "Rio Branco", "Santana", "São João"], "Caxias do Sul": ["Centro", "Desvio Rizzo", "Nossa Senhora de Fátima", "São Pelegrino", "Sagrada Família"] } },
  RO: { nome: "Rondônia", cidades: { "Porto Velho": ["Centro", "Cascalheira", "Embratel", "Lagoa", "Nacional", "Nova Floresta", "Pedrinhas", "Potiguara"] } },
  RR: { nome: "Roraima", cidades: { "Boa Vista": ["Centro", "Asa Branca", "Caimbé", "Canarinho", "Caranã", "Imperial", "Jardim Primavera"] } },
  SC: { nome: "Santa Catarina", cidades: { "Florianópolis": ["Agronômica", "Barreiros", "Carianos", "Centro", "Continente", "Córrego Grande", "Ingleses", "Itacorubi", "João Paulo", "Jurerê", "Lagoa da Conceição", "Rio Tavares", "Santa Mônica", "Trindade"], "Joinville": ["América", "Anita Garibaldi", "Atiradores", "Bom Retiro", "Centro", "Glória", "Iririú", "Jardim Iririú"] } },
  SP: { nome: "São Paulo", cidades: { "São Paulo": ["Alto de Pinheiros", "Bela Vista", "Bom Retiro", "Brooklin", "Butantã", "Campo Belo", "Centro", "Consolação", "Higienópolis", "Itaim Bibi", "Jardim América", "Jardim Paulista", "Lapa", "Liberdade", "Moema", "Morumbi", "Pinheiros", "Perdizes", "Santa Cecília", "Santo André", "Santana", "Tatuapé", "Vila Mariana", "Vila Madalena", "Vila Olímpia"], "Campinas": ["Barão Geraldo", "Cambuí", "Centro", "Jardim Guanabara", "Nova Campinas", "Ponte Preta", "Taquaral", "Vívio"], "Santos": ["Boqueirão", "Centro", "Embaré", "Gonzaga", "José Menino", "Pompéia", "Ponta da Praia", "Vila Belmiro"] } },
  SE: { nome: "Sergipe", cidades: { "Aracaju": ["Centro", "Atalaia", "Coroa do Meio", "Farolândia", "Grageru", "Jabotiana", "Jardins", "Luzia", "Ponto Novo", "São Conrado", "Salgado Filho", "Suíça", "Treze de Julho"] } },
  TO: { nome: "Tocantins", cidades: { "Palmas": ["Centro", "Aureny", "Jardim Aureny I", "Jardim Aureny II", "Taquaralto", "Taquaruçu"] } },
};

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function BusinessSettingsTab() {
  const { user } = useAuth();
  const { business, isLoading: bizLoading, refetch: refetchBiz } = useMyBusiness();
  const queryClient = useQueryClient();
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", slug: "", description: "", category: "beleza",
    state: "", city: "", neighborhood: "", address: "", phone: "",
    banner_url: "",
  });
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    if (business) {
      const b = business as any;
      const stateKey = Object.keys(ESTADOS).find(k => ESTADOS[k].nome === b.state) || b.state || "";
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
        banner_url: b.banner_url || "",
      });
      if (b.banner_url) setBannerPreview(b.banner_url);
    }
  }, [business]);

  const selectedCities = form.state ? Object.keys(ESTADOS[form.state]?.cidades || {}) : [];
  const selectedNeighborhoods = (form.state && form.city)
    ? (ESTADOS[form.state]?.cidades[form.city] || [])
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
      setForm((f) => ({ ...f, banner_url: data.publicUrl }));
      setBannerPreview(data.publicUrl);
      toast.success("Banner carregado!");
    } catch (err: any) {
      toast.error("Erro ao enviar banner: " + (err.message || ""));
    } finally {
      setUploadingBanner(false);
    }
  };

  const removeBanner = () => {
    setForm((f) => ({ ...f, banner_url: "" }));
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

  const saveBusiness = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        state: form.state ? ESTADOS[form.state]?.nome : form.state,
      };
      if (business) {
        const { error } = await supabase.from("businesses").update(payload).eq("id", business.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("businesses").insert({ ...payload, owner_id: user!.id });
        if (error) throw error;
        const { data: newBiz } = await supabase.from("businesses").select("id").eq("owner_id", user!.id).single();
        if (newBiz) {
          await supabase.from("availability").insert(
            [0,1,2,3,4,5,6].map(d => ({
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

          {/* Banner Upload */}
          <div>
            <Label className="mb-2 block">Banner do negócio</Label>
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
                  : <><ImagePlus className="w-8 h-8" /><span className="text-sm">Clique para enviar o banner (JPG, PNG — máx. 3MB)</span></>
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
                  {Object.entries(ESTADOS).sort((a, b) => a[1].nome.localeCompare(b[1].nome)).map(([uf, { nome }]) => (
                    <SelectItem key={uf} value={uf}>{nome} ({uf})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cidade */}
            <div>
              <Label>Cidade</Label>
              <Select
                value={form.city}
                onValueChange={(v) => setForm({ ...form, city: v, neighborhood: "" })}
                disabled={!form.state}
              >
                <SelectTrigger><SelectValue placeholder={form.state ? "Selecione a cidade" : "Escolha o estado primeiro"} /></SelectTrigger>
                <SelectContent>
                  {selectedCities.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
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
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />Profissionais</CardTitle>
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
