import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Instagram, MessageCircle, Quote, CheckCircle2, ArrowUp, MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface BusinessSiteProps {
  business: any;
}

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function BusinessSite({ business }: BusinessSiteProps) {
  // Carrega horários para a seção "Como nos visitar". Hook chamado mesmo se site não habilitado
  // para respeitar regras de hooks; query só dispara quando site_enabled.
  const { data: availability = [] } = useQuery({
    queryKey: ["business-site-availability", business?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("business_id", business.id)
        .eq("enabled", true)
        .order("day_of_week");
      if (error) throw error;
      return data;
    },
    enabled: !!business?.site_enabled && !!business?.id,
  });

  if (!business?.site_enabled) return null;

  const gallery: string[] = Array.isArray(business.site_gallery) ? business.site_gallery : [];
  const features: string[] = Array.isArray(business.site_features) ? business.site_features : [];
  const testimonials: { name: string; text: string }[] = Array.isArray(business.site_testimonials) ? business.site_testimonials : [];
  const headline = business.site_headline || `Bem-vindo à ${business.name}`;
  const subheadline = business.site_subheadline || "";
  const about = business.site_about || "";
  const ctaLabel = business.site_cta_label || "Agendar agora";
  const whatsapp = (business.site_whatsapp || "").replace(/\D/g, "");
  const instagram = (business.site_instagram || "").replace(/^@/, "");
  const phoneClean = (business.phone || "").replace(/\D/g, "");

  const addressParts = [business.address, business.neighborhood, business.city].filter(Boolean);
  const fullAddress = addressParts.join(", ");
  const mapsQuery = encodeURIComponent([business.name, ...addressParts].filter(Boolean).join(", "));

  const scrollToBooking = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <section className="border-t bg-card">
      <div className="container mx-auto px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">{headline}</h2>
          {subheadline && <p className="text-lg text-muted-foreground">{subheadline}</p>}
          <Button
            size="lg"
            className="mt-6 gradient-primary text-primary-foreground"
            onClick={scrollToBooking}
          >
            {ctaLabel}
          </Button>
        </motion.div>

        {about && (
          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-base text-foreground/80 whitespace-pre-line leading-relaxed text-center">
              {about}
            </p>
            <div className="flex justify-center mt-6">
              <Button
                size="lg"
                className="gradient-primary text-primary-foreground shadow-glow"
                onClick={scrollToBooking}
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                {ctaLabel}
              </Button>
            </div>
          </div>
        )}

        {features.length > 0 && (
          <div className="max-w-4xl mx-auto mb-12 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border bg-background">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        )}

        {gallery.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold mb-4 text-center">Galeria</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {gallery.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Galeria ${i + 1}`}
                  loading="lazy"
                  className="w-full h-40 object-cover rounded-xl border"
                />
              ))}
            </div>
          </div>
        )}

        {testimonials.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold mb-4 text-center">Depoimentos</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {testimonials.map((t, i) => (
                <div key={i} className="p-5 rounded-xl border bg-background">
                  <Quote className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm text-foreground/80 italic mb-3">"{t.text}"</p>
                  <p className="text-sm font-semibold">— {t.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Como nos visitar — seção informativa para o cliente */}
        {(fullAddress || availability.length > 0 || phoneClean || whatsapp) && (
          <div className="max-w-5xl mx-auto mb-12">
            <h3 className="text-xl font-bold mb-6 text-center">Como nos encontrar</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fullAddress && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border bg-background p-5 hover:border-primary hover:shadow-sm transition-all flex items-start gap-3"
                >
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Endereço</p>
                    <p className="text-sm text-foreground">{fullAddress}</p>
                    <p className="text-xs text-primary mt-2 group-hover:underline">Abrir no Google Maps →</p>
                  </div>
                </a>
              )}
              {availability.length > 0 && (
                <div className="rounded-xl border bg-background p-5 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Horários</p>
                    <ul className="space-y-1 text-sm">
                      {availability.map((a: any) => (
                        <li key={a.id} className="flex items-center justify-between gap-3">
                          <span className="text-muted-foreground">{DAY_NAMES[a.day_of_week]}</span>
                          <span className="font-medium tabular-nums">
                            {a.start_time?.slice(0, 5)} – {a.end_time?.slice(0, 5)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {(phoneClean || whatsapp) && (
                <div className="rounded-xl border bg-background p-5 flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Contato direto</p>
                    <div className="space-y-2">
                      {phoneClean && (
                        <a href={`tel:${phoneClean}`} className="flex items-center justify-between text-sm hover:text-primary">
                          <span className="text-muted-foreground">Telefone</span>
                          <span className="font-medium">{business.phone}</span>
                        </a>
                      )}
                      {whatsapp && (
                        <a
                          href={`https://wa.me/${whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-sm hover:text-primary"
                        >
                          <span className="text-muted-foreground">WhatsApp</span>
                          <span className="font-medium">{whatsapp}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {(whatsapp || instagram) && (
          <div className="flex flex-wrap justify-center gap-3">
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </Button>
              </a>
            )}
            {instagram && (
              <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <Instagram className="w-4 h-4" /> @{instagram}
                </Button>
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}