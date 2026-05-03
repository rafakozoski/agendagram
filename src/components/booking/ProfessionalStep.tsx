import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Loader2 } from "lucide-react";

interface Props {
  serviceId: string | null;
  selected: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
  businessId?: string;
}

export function ProfessionalStep({ serviceId, selected, onSelect, onBack, businessId }: Props) {
  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ["professionals", serviceId],
    queryFn: async () => {
      if (!serviceId) return [];
      // Get professionals linked to this service
      const { data: links, error: linkErr } = await supabase
        .from("professional_services")
        .select("professional_id")
        .eq("service_id", serviceId);
      if (linkErr) throw linkErr;

      if (links.length === 0) {
        let query = supabase.from("professionals").select("*").order("name");
        if (businessId) query = query.eq("business_id", businessId);
        const { data, error } = await query;
        if (error) throw error;
        return data;
      }

      const ids = links.map((l) => l.professional_id);
      const { data, error } = await supabase.from("professionals").select("*").in("id", ids).order("name");
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-base md:text-lg font-semibold leading-tight">Escolha o profissional</h3>
      </div>
      <div className="grid gap-2 md:gap-3">
        {professionals.length === 0 && (
          <p className="text-muted-foreground text-center py-8">Nenhum profissional disponível para este serviço.</p>
        )}
        {professionals.map((pro) => (
          <button
            key={pro.id}
            onClick={() => onSelect(pro.id)}
            className={`w-full text-left p-3 md:p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md flex items-center gap-3 md:gap-4 ${
              selected === pro.id
                ? "border-primary bg-primary/5 shadow-glow"
                : "border-border hover:border-primary/40"
            }`}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full gradient-primary flex items-center justify-center shrink-0">
              <User className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm md:text-base leading-tight truncate">{pro.name}</p>
              <p className="text-xs md:text-sm text-muted-foreground leading-snug truncate">{pro.role}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
