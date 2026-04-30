import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logoImg from "@/assets/logo-agendagram.png";

const SEGMENTS = [
  { label: "Salão de Beleza", path: "/sistema-de-agendamento-para-salao-de-beleza" },
  { label: "Barbearia", path: "/sistema-de-agendamento-para-barbearia" },
  { label: "Manicure", path: "/sistema-de-agendamento-para-manicure" },
  { label: "Estética", path: "/sistema-de-agendamento-para-clinica-de-estetica" },
  { label: "Clínica Médica", path: "/sistema-de-agendamento-para-clinica-medica" },
  { label: "Dentista", path: "/sistema-de-agendamento-para-dentista" },
  { label: "Psicólogo", path: "/sistema-de-agendamento-para-psicologo" },
  { label: "Nutricionista", path: "/sistema-de-agendamento-para-nutricionista" },
  { label: "Fisioterapeuta", path: "/sistema-de-agendamento-para-fisioterapeuta" },
  { label: "Personal Trainer", path: "/sistema-de-agendamento-para-personal-trainer" },
  { label: "Pilates", path: "/sistema-de-agendamento-para-estudio-de-pilates" },
  { label: "Quadra Esportiva", path: "/sistema-de-agendamento-para-quadra-esportiva" },
  { label: "Advogado", path: "/sistema-de-agendamento-para-advogado" },
  { label: "Contador", path: "/sistema-de-agendamento-para-contador" },
  { label: "Consultor", path: "/sistema-de-agendamento-para-consultor" },
  { label: "Pet Shop", path: "/sistema-de-agendamento-para-pet-shop" },
  { label: "Veterinária", path: "/sistema-de-agendamento-para-clinica-veterinaria" },
  { label: "Lava-Car", path: "/sistema-de-agendamento-para-lava-car" },
  { label: "Auto Escola", path: "/sistema-de-agendamento-para-auto-escolas" },
  { label: "Limpeza", path: "/sistema-de-agendamento-para-servico-de-limpeza" },
];

export function Footer() {
  const { data: businesses = [] } = useQuery({
    queryKey: ["footer-businesses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("name, slug, city")
        .order("featured", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data;
    },
  });

  return (
    <footer className="border-t bg-card mt-12">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img src={logoImg} alt="Agendagram" className="h-8" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Plataforma de agendamento online para profissionais e estabelecimentos.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground">Plataforma</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary">Início</Link></li>
              <li><Link to="/planos" className="text-muted-foreground hover:text-primary">Planos</Link></li>
              <li><Link to="/contratar" className="text-muted-foreground hover:text-primary">Contratar</Link></li>
              <li><Link to="/login" className="text-muted-foreground hover:text-primary">Entrar</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground">Para o seu segmento</h3>
            <ul className="space-y-2 text-sm max-h-72 overflow-hidden">
              {SEGMENTS.slice(0, 10).map((s) => (
                <li key={s.path}>
                  <Link to={s.path} className="text-muted-foreground hover:text-primary">{s.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground">Mais segmentos</h3>
            <ul className="space-y-2 text-sm max-h-72 overflow-hidden">
              {SEGMENTS.slice(10).map((s) => (
                <li key={s.path}>
                  <Link to={s.path} className="text-muted-foreground hover:text-primary">{s.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {businesses.length > 0 && (
          <div className="border-t pt-6 mb-6">
            <h3 className="font-semibold text-sm mb-3 text-foreground">Estabelecimentos em destaque</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {businesses.map((b) => (
                <Link
                  key={b.slug}
                  to={`/${b.slug}`}
                  className="text-muted-foreground hover:text-primary"
                >
                  {b.name}{b.city ? ` · ${b.city}` : ""}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Agendagram. Todos os direitos reservados.</p>
          <p>agendagram.com.br</p>
        </div>
      </div>
    </footer>
  );
}