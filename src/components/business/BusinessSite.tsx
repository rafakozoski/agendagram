import { motion } from "framer-motion";
import { Instagram, MessageCircle, Quote, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BusinessSiteProps {
  business: any;
}

export function BusinessSite({ business }: BusinessSiteProps) {
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
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            {ctaLabel}
          </Button>
        </motion.div>

        {about && (
          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-base text-foreground/80 whitespace-pre-line leading-relaxed text-center">
              {about}
            </p>
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