import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookingFlow } from "@/components/BookingFlow";
import { ArrowLeft, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="gradient-hero py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <Link to="/" className="inline-flex items-center gap-1 text-primary-foreground/60 hover:text-primary-foreground text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground">
            {business.name}
          </h1>
          <div className="flex flex-wrap gap-4 mt-3 text-primary-foreground/70 text-sm">
            {business.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {business.city}
                {business.address && ` — ${business.address}`}
              </span>
            )}
            {business.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" /> {business.phone}
              </span>
            )}
          </div>
          {business.description && (
            <p className="text-primary-foreground/60 mt-3 max-w-xl">{business.description}</p>
          )}
        </div>
      </section>

      {/* Booking Flow filtered by business */}
      <BookingFlow businessId={business.id} />
    </div>
  );
}
