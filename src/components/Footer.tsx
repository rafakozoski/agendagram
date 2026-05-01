import { Link } from "react-router-dom";
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
  return (
    <footer className="border-t mt-12 bg-secondary-foreground text-secondary">
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
            <h3 className="font-semibold text-sm mb-3 text-secondary">Plataforma</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary">Início</Link></li>
              <li><Link to="/planos" className="text-muted-foreground hover:text-primary">Planos</Link></li>
              <li><Link to="/contratar" className="text-muted-foreground hover:text-primary">Contratar</Link></li>
              <li><Link to="/login" className="text-muted-foreground hover:text-primary">Entrar</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-secondary">Para o seu segmento</h3>
            <ul className="space-y-2 text-sm max-h-72 overflow-hidden">
              {SEGMENTS.slice(0, 10).map((s) => (
                <li key={s.path}>
                  <Link to={s.path} className="text-muted-foreground hover:text-primary">{s.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-secondary">Mais segmentos</h3>
            <ul className="space-y-2 text-sm max-h-72 overflow-hidden">
              {SEGMENTS.slice(10).map((s) => (
                <li key={s.path}>
                  <Link to={s.path} className="text-muted-foreground hover:text-primary">{s.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Agendagram. Todos os direitos reservados.</p>
          <p>agendagram.com.br</p>
        </div>
      </div>
    </footer>
  );
}