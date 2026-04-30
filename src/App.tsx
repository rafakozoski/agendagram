import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { useAuth } from "./hooks/useAuth";
import { useUserRole } from "./hooks/useUserRole";
import Index from "./pages/Index";
import BusinessPage from "./pages/BusinessPage";
import AdminPanel from "./pages/AdminPanel";
import BusinessPanel from "./pages/BusinessPanel";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import PricingPage from "./pages/PricingPage";
import ContratarPage from "./pages/ContratarPage";

import SalaoBelezaPage from "./pages/lps/SalaoBelezaPage";
import BarbeariaPage from "./pages/lps/BarbeariaPage";
import ManicurePage from "./pages/lps/ManicurePage";
import EsteticaPage from "./pages/lps/EsteticaPage";
import ClinicaMedicaPage from "./pages/lps/ClinicaMedicaPage";
import DentistaPage from "./pages/lps/DentistaPage";
import PsicologoPage from "./pages/lps/PsicologoPage";
import TerapeutaPage from "./pages/lps/TerapeutaPage";
import NutricionistaPage from "./pages/lps/NutricionistaPage";
import FisioterapeutaPage from "./pages/lps/FisioterapeutaPage";
import FonoaudiologoPage from "./pages/lps/FonoaudiologoPage";
import DermatologistaPage from "./pages/lps/DermatologistaPage";
import PilatesPage from "./pages/lps/PilatesPage";
import PersonalTrainerPage from "./pages/lps/PersonalTrainerPage";
import QuadraEsportivaPage from "./pages/lps/QuadraEsportivaPage";
import ProfessorParticularPage from "./pages/lps/ProfessorParticularPage";
import AdvogadoPage from "./pages/lps/AdvogadoPage";
import ContadorPage from "./pages/lps/ContadorPage";
import ConsultorPage from "./pages/lps/ConsultorPage";
import MentorPage from "./pages/lps/MentorPage";
import LavaCarPage from "./pages/lps/LavaCarPage";
import EsteticaAutomotivaPage from "./pages/lps/EsteticaAutomotivaPage";
import AutoEscolaPage from "./pages/lps/AutoEscolaPage";
import PetShopPage from "./pages/lps/PetShopPage";
import VeterinariaPage from "./pages/lps/VeterinariaPage";
import AdestradorPage from "./pages/lps/AdestradorPage";
import DogWalkerPage from "./pages/lps/DogWalkerPage";
import LimpezaPage from "./pages/lps/LimpezaPage";
import InstaladoresPage from "./pages/lps/InstaladoresPage";

const queryClient = new QueryClient();

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  if (loading || roleLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/painel" replace />;
  return <>{children}</>;
}

// Painel do dono do negócio: exige role owner OU admin (admin pode operar negócio próprio)
function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isAdmin, isOwner, loading: roleLoading } = useUserRole();
  if (loading || roleLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isOwner && !isAdmin) return <Navigate to="/contratar" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/planos" element={<PricingPage />} />
          <Route path="/contratar" element={<ContratarPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/admin/login" element={<AuthPage />} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="/painel" element={<OwnerRoute><BusinessPanel /></OwnerRoute>} />
                    <Route path="/sistema-de-agendamento-para-salao-de-beleza" element={<SalaoBelezaPage />} />
          <Route path="/sistema-de-agendamento-para-barbearia" element={<BarbeariaPage />} />
          <Route path="/sistema-de-agendamento-para-manicure" element={<ManicurePage />} />
          <Route path="/sistema-de-agendamento-para-clinica-de-estetica" element={<EsteticaPage />} />
          <Route path="/sistema-de-agendamento-para-clinica-medica" element={<ClinicaMedicaPage />} />
          <Route path="/sistema-de-agendamento-para-dentista" element={<DentistaPage />} />
          <Route path="/sistema-de-agendamento-para-psicologo" element={<PsicologoPage />} />
          <Route path="/sistema-de-agendamento-para-terapeuta" element={<TerapeutaPage />} />
          <Route path="/sistema-de-agendamento-para-nutricionista" element={<NutricionistaPage />} />
          <Route path="/sistema-de-agendamento-para-fisioterapeuta" element={<FisioterapeutaPage />} />
          <Route path="/sistema-de-agendamento-para-fonoaudiologo" element={<FonoaudiologoPage />} />
          <Route path="/sistema-de-agendamento-para-dermatologista" element={<DermatologistaPage />} />
          <Route path="/sistema-de-agendamento-para-estudio-de-pilates" element={<PilatesPage />} />
          <Route path="/sistema-de-agendamento-para-personal-trainer" element={<PersonalTrainerPage />} />
          <Route path="/sistema-de-agendamento-para-quadra-esportiva" element={<QuadraEsportivaPage />} />
          <Route path="/sistema-de-agendamento-para-professor-particular" element={<ProfessorParticularPage />} />
          <Route path="/sistema-de-agendamento-para-advogado" element={<AdvogadoPage />} />
          <Route path="/sistema-de-agendamento-para-contador" element={<ContadorPage />} />
          <Route path="/sistema-de-agendamento-para-consultor" element={<ConsultorPage />} />
          <Route path="/sistema-de-agendamento-para-mentor" element={<MentorPage />} />
          <Route path="/sistema-de-agendamento-para-lava-car" element={<LavaCarPage />} />
          <Route path="/sistema-de-agendamento-para-estetica-automotiva" element={<EsteticaAutomotivaPage />} />
          <Route path="/sistema-de-agendamento-para-auto-escolas" element={<AutoEscolaPage />} />
          <Route path="/sistema-de-agendamento-para-pet-shop" element={<PetShopPage />} />
          <Route path="/sistema-de-agendamento-para-clinica-veterinaria" element={<VeterinariaPage />} />
          <Route path="/sistema-de-agendamento-para-adestrador-de-caes" element={<AdestradorPage />} />
          <Route path="/sistema-de-agendamento-para-dog-walker" element={<DogWalkerPage />} />
          <Route path="/sistema-de-agendamento-para-servico-de-limpeza" element={<LimpezaPage />} />
          <Route path="/sistema-de-agendamento-para-instaladores" element={<InstaladoresPage />} />
          <Route path="/:slug" element={<BusinessPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
