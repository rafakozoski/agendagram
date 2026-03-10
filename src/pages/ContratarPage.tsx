import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Link2, TrendingUp, Zap, ArrowRight, CheckCircle2, Star } from "lucide-react";
import logoImg from "@/assets/logo-reservagram.png";

const BENEFITS = [
  {
    icon: Zap,
    title: "Integração em minutos",
    desc: "Cadastre seu negócio, adicione seus serviços e profissionais. Pronto para receber agendamentos no mesmo dia.",
  },
  {
    icon: CalendarCheck,
    title: "Agenda inteligente",
    desc: "Seus clientes agendam online 24h. Sem ligações, sem WhatsApp, sem perder horários vagos.",
  },
  {
    icon: Link2,
    title: "Link exclusivo para divulgar",
    desc: "Receba um link personalizado (reservagram.app/seunegocio) para compartilhar nas redes sociais e anúncios.",
  },
  {
    icon: TrendingUp,
    title: "Mais clientes, mais vendas",
    desc: "Negócios com agendamento online recebem até 3x mais reservas. Não perca mais nenhum cliente.",
  },
];

const PROOF_POINTS = [
  "Sem taxa por agendamento",
  "Cancele quando quiser",
  "Suporte dedicado",
  "Painel completo de gestão",
];

export default function ContratarPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container mx-auto px-6 py-16 md:py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <img src={logoImg} alt="Reservagram" className="h-10 mx-auto mb-8" />
            <h1
              className="text-3xl md:text-5xl font-extrabold text-primary-foreground mb-5 leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Pare de perder clientes.
              <br />
              <span className="text-accent">Automatize seus agendamentos.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              A plataforma mais simples do Brasil para seu negócio receber agendamentos online. 
              Comece em minutos, sem complicação.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing">
                <Button size="lg" className="gradient-primary text-primary-foreground text-lg px-8 py-6 shadow-glow">
                  Começar agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <p className="text-primary-foreground/60 text-sm mt-4">
              Planos a partir de R$29,90/mês • Sem fidelidade
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-4xl font-bold text-center mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Por que escolher o <span className="text-primary">Reservagram</span>?
        </motion.h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Tudo que você precisa para profissionalizar seu atendimento e faturar mais.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                <b.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">{b.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social proof / trust */}
      <section className="bg-muted/50">
        <div className="container mx-auto px-6 py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl font-medium mb-4 italic text-foreground">
                "Antes eu perdia clientes por não atender no WhatsApp a tempo. 
                Agora eles agendam sozinhos, a qualquer hora."
              </blockquote>
              <p className="text-muted-foreground text-sm">— Proprietário de barbearia</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Proof points + CTA */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-bold mb-8"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Pronto para <span className="text-primary">crescer</span>?
          </motion.h2>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {PROOF_POINTS.map((point) => (
              <div key={point} className="flex items-center gap-2 bg-card border rounded-full px-4 py-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium">{point}</span>
              </div>
            ))}
          </div>

          <Link to="/pricing">
            <Button size="lg" className="gradient-primary text-primary-foreground text-lg px-10 py-6 shadow-glow">
              Ver planos e começar
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-muted-foreground text-sm mt-4">
            Cadastro rápido • Sem cartão para testar
          </p>
        </div>
      </section>
    </div>
  );
}
