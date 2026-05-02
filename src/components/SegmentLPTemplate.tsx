import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Link2, TrendingUp, Zap, ArrowRight, CheckCircle2, Star, Search, Shield, Trophy } from "lucide-react";
import logoImg from "@/assets/logo-agendagram-bc.png";
import { setSeo, resetSeo } from "@/lib/seo";

export interface SegmentLPProps {
  nichoTitle: string; // Ex: Barbearias
  nichoShort: string; // Ex: a sua Barbearia
  heroSubtitle: string;
  benefits: {
    icon: any;
    title: string;
    desc: string;
  }[];
  imageUrl: string;
  imageAlt: string;
  /** Sobrescreve title de SEO. Se omitido, gera baseado em nichoTitle. */
  seoTitle?: string;
  /** Sobrescreve description de SEO. Se omitida, usa heroSubtitle. */
  seoDescription?: string;
}

const PROOF_POINTS = [
  "Sem taxa por agendamento",
  "Cancele quando quiser",
  "Suporte dedicado",
  "Painel completo de gestão",
];

export function SegmentLPTemplate({
  nichoTitle,
  nichoShort,
  heroSubtitle,
  benefits,
  imageUrl,
  imageAlt,
  seoTitle,
  seoDescription,
}: SegmentLPProps) {
  const location = useLocation();

  // SEO por LP: title/description/canonical + JSON-LD Service
  useEffect(() => {
    const title = seoTitle || `Sistema de agendamento para ${nichoTitle} | Agendagram`;
    const description = seoDescription || heroSubtitle;
    const canonical =
      typeof window !== "undefined"
        ? `${window.location.origin}${location.pathname}`
        : `https://agendagram.com.br${location.pathname}`;
    setSeo({
      title,
      description,
      canonical,
      ogImage: imageUrl,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Service",
        name: `Agendagram para ${nichoTitle}`,
        description,
        url: canonical,
        provider: {
          "@type": "Organization",
          name: "Agendagram",
          url: "https://agendagram.com.br",
        },
        areaServed: { "@type": "Country", name: "Brasil" },
        category: nichoTitle,
      },
    });
    return () => resetSeo();
  }, [nichoTitle, heroSubtitle, imageUrl, location.pathname, seoTitle, seoDescription]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container mx-auto px-6 py-16 md:py-24 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 text-left"
          >
            <img src={logoImg} alt="Agendagram" className="h-10 mb-8" />
            <h1
              className="text-3xl md:text-5xl font-extrabold text-primary-foreground mb-5 leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Sistema de gestão online para <span className="text-accent">{nichoTitle}</span>.
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 leading-relaxed max-w-lg">
              {heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/planos">
                <Button size="lg" className="gradient-primary text-primary-foreground text-lg px-8 py-6 shadow-glow w-full sm:w-auto">
                  Testar plataforma
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <p className="text-primary-foreground/60 text-sm mt-4">
              Comece em minutos • Cancele quando quiser
            </p>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full max-w-lg relative"
          >
             <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video md:aspect-square object-cover border-4 border-white/10">
                <img src={imageUrl} alt={imageAlt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <p className="text-white font-medium text-lg leading-tight">A ferramenta completa para {nichoShort}.</p>
                </div>
             </div>
             {/* Floating badge */}
             <div className="absolute -bottom-6 -left-6 bg-card dark:bg-background p-4 rounded-2xl shadow-xl flex items-center gap-3 border animate-in zoom-in slide-in-from-bottom-4 duration-500 delay-300">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CalendarCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                   <p className="text-sm font-bold">Agenda cheia</p>
                   <p className="text-xs text-muted-foreground">+200% agendamentos</p>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

       {/* Vitrine / Diretório Upsell */}
       <section className="bg-secondary/40 border-y">
        <div className="container mx-auto px-6 py-16 md:py-20">
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex-1"
            >
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-6 shadow-md">
                    <Search className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Muito mais que uma agenda. Uma <span className="text-primary">Vitrine de Negócios</span>.
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                    Ao usar o Agendagram, seu negócio ganha uma página pública no nosso diretório focada na sua localidade. Clientes em potencial buscando por {nichoTitle.toLowerCase()} na sua região vão encontrar os seus serviços e podem agendar imediatamente.
                </p>
                <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-accent"/> Seja encontrado por novos clientes na busca local.</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-accent"/> Envie o seu link exclusivo ({`agendagram.com.br/seu-negocio`}).</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-accent"/> Avaliações e histórico de agendamentos no seu perfil.</li>
                </ul>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex-[0.8] w-full"
            >
               <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-[2px] rounded-3xl shadow-xl">
                  <div className="bg-card rounded-[22px] p-8 text-center h-full flex flex-col justify-center items-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-2 gradient-accent"></div>
                      <Trophy className="w-12 h-12 text-accent mb-4" />
                      <h3 className="font-bold text-xl mb-2">Assinatura Destaque</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Impulsione seu crescimento! Ganhe prioridade máxima nas buscas e exiba um banner personalizado no topo do seu perfil e na área de {nichoTitle.toLowerCase()}.
                      </p>
                      <Link to="/planos">
                        <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-white">Conhecer o Plano Destaque</Button>
                      </Link>
                  </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Specific Benefits */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-center mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Feito sob medida para <span className="text-primary">{nichoTitle}</span>
        </motion.h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Tudo que você precisa para profissionalizar seu atendimento, gerir as reservas e faturar mais todo mês.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-glow">
                <b.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">{b.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social proof / trust */}
      <section className="bg-muted/50 border-y">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl font-medium mb-6 italic text-foreground leading-relaxed">
                "Antes eu perdia tempo e clientes marcando horários manualmente. 
                Agora minha agenda enche sozinha e eu só me preocupo em atender bem."
              </blockquote>
              <p className="text-muted-foreground font-medium">— Parceiro Agendagram</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-bold mb-8"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Sua ferramenta completa de gestão. <br />
            <span className="text-primary">Pronto para começar?</span>
          </motion.h2>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {PROOF_POINTS.map((point) => (
              <div key={point} className="flex items-center gap-2 bg-card border rounded-full px-4 py-2 shadow-sm">
                <Shield className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium">{point}</span>
              </div>
            ))}
          </div>

          <Link to="/planos">
            <Button size="lg" className="gradient-primary text-primary-foreground text-lg px-10 py-6 shadow-glow">
              Ver planos e começar
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-muted-foreground text-sm mt-4">
            Cadastro rápido em 2 minutos.
          </p>
        </div>
      </section>
    </div>
  );
}
