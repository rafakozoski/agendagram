import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Tag, Loader2 } from "lucide-react";

interface Props {
  selected: string | null;
  onSelect: (id: string) => void;
}

export function ServiceStep({ selected, onSelect }: Props) {
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-6">Escolha o serviço</h3>
      <div className="grid gap-3">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service.id)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
              selected === service.id
                ? "border-primary bg-primary/5 shadow-glow"
                : "border-border hover:border-primary/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{service.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    service.type === 'service' ? 'bg-primary/10 text-primary' : 'gradient-accent text-accent-foreground'
                  }`}>
                    {service.type === 'service' ? 'Serviço' : 'Produto'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <div className="flex items-center gap-1 text-primary font-bold">
                  <Tag className="w-3.5 h-3.5" />
                  R$ {Number(service.price).toFixed(2)}
                </div>
                {service.duration > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    {service.duration} min
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
