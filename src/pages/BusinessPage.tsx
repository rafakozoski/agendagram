import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookingFlow } from "@/components/BookingFlow";
import { ArrowLeft, MapPin, Phone, Star, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: business, isLoading, error } = useQuery({
    queryKey: ["business", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["business-services", business?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", business!.id)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!business?.id,
  });

  const { data: professionals = [] } = useQuery({
    queryKey: ["business-professionals", business?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("business_id", business!.id)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!business?.id,
  });

  const { data: availability = [] } = useQuery({
    queryKey: ["business-availability", business?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("business_id", business!.id)
        .eq("enabled", true)
        .order("day_of_week");
      if (error) throw error;
      return data;
    },
    enabled: !!business?.id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-96 w-full mt-8" />
      </div>
    );
  }

  if (!business || error) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Estabelecimento não encontrado</h1>
        <p className="text-muted-foreground mb-6">Verifique o endereço e tente novamente.</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar à página inicial
          </Button>
        </Link>
      </div>
    );
  }

  const biz = business as any;
  const isPro = biz.featured === true;
  const hasCover = !!biz.cover_url;

  const locationParts = [biz.neighborhood, business.city, business.address].filter(Boolean);

  const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {isPro && hasCover ? (
        <section className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={biz.cover_url}
            alt={`Banner de ${business.name}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/20" />
          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-6 pb-6 z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-foreground/60 hover:text-foreground text-sm mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
            <div className="flex items-center gap-3 mb-1">
              {biz.logo_url && (
                <img
                  src={biz.logo_url}
                  alt={business.name}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-background shadow-lg"
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-4xl font-extrabold text-foreground">
                    {business.name}
                  </h1>
                  <Badge variant="default" className="gap-1">
                    <Star className="w-3 h-3" /> Destaque
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="gradient-hero py-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-primary-foreground/60 hover:text-primary-foreground text-sm mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground">
              {business.name}
            </h1>
          </div>
        </section>
      )}

      {/* Business Info Bar */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {locationParts.length > 0 && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" /> {locationParts.join(" — ")}
              </span>
            )}
            {business.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-primary" /> {business.phone}
              </span>
            )}
            {availability.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                {availability.map((a) => DAY_NAMES[a.day_of_week]).join(", ")} · {availability[0]?.start_time?.slice(0, 5)} – {availability[0]?.end_time?.slice(0, 5)}
              </span>
            )}
          </div>
          {business.description && (
            <p className="text-muted-foreground mt-2 max-w-2xl">{business.description}</p>
          )}
        </div>
      </div>

      {/* Pro: Extra info section */}
      {isPro && (professionals.length > 0 || services.length > 0) && (
        <div className="border-b bg-card/50">
          <div className="container mx-auto px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team */}
              {professionals.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" /> Nossa Equipe
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {professionals.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2"
                      >
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {p.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          {p.role && <p className="text-xs text-muted-foreground">{p.role}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services preview */}
              {services.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" /> Serviços
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {services.slice(0, 8).map((s) => (
                      <Badge key={s.id} variant="secondary" className="text-xs">
                        {s.name}
                        {s.price > 0 && (
                          <span className="ml-1 text-primary font-semibold">
                            R$ {Number(s.price).toFixed(0)}
                          </span>
                        )}
                      </Badge>
                    ))}
                    {services.length > 8 && (
                      <Badge variant="outline" className="text-xs">
                        +{services.length - 8} mais
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <BookingFlow businessId={business.id} />
    </div>
  );
}
