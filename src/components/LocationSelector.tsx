import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocations } from "@/hooks/useLocations";
import { cn } from "@/lib/utils";

export interface LocationValue {
  /** Código UF, ex: "SP" */
  state: string;
  city: string;
  /** Texto livre. Sugestões da base são clicáveis mas não obrigatórias. */
  neighborhood: string;
}

interface LocationSelectorProps {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
  className?: string;
  /** Renderiza grid em 1 coluna mesmo em telas md+. Útil em diálogos estreitos. */
  compact?: boolean;
}

/**
 * Seletor de Estado + Cidade (dropdown com base de dados) + Bairro (texto livre
 * com sugestões clicáveis baseadas na cidade selecionada).
 *
 * Mantém compatibilidade com o schema atual (businesses.state armazena o NOME
 * por extenso — quem consome o componente faz a tradução code→name antes de
 * salvar).
 */
export function LocationSelector({ value, onChange, className, compact }: LocationSelectorProps) {
  const {
    states,
    getCities,
    getNeighborhoods,
    findStateByCity,
    getAllCitiesWithState,
    isLoading,
  } = useLocations();

  const citiesToShow = value.state
    ? getCities(value.state).map((c) => ({
        city: c,
        stateKey: value.state,
        stateName: states.find((s) => s.code === value.state)?.name ?? "",
      }))
    : getAllCitiesWithState();

  const neighborhoodSuggestions =
    value.state && value.city ? getNeighborhoods(value.city, value.state) : [];

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        !compact && "md:grid-cols-2",
        className,
      )}
    >
      {/* Estado */}
      <div>
        <Label>Estado</Label>
        <Select
          value={value.state}
          onValueChange={(v) =>
            onChange({ state: v, city: "", neighborhood: "" })
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {states.map((s) => (
              <SelectItem key={s.code} value={s.code}>
                {s.name} ({s.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cidade */}
      <div>
        <Label>Cidade</Label>
        <Select
          value={value.city}
          onValueChange={(v) => {
            const stateKey = findStateByCity(v);
            onChange({
              ...value,
              city: v,
              neighborhood: "",
              state: stateKey || value.state,
            });
          }}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a cidade" />
          </SelectTrigger>
          <SelectContent>
            {citiesToShow.map((c) => (
              <SelectItem key={`${c.stateKey}-${c.city}`} value={c.city}>
                {c.city}
                {!value.state && ` (${c.stateKey})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bairro - input livre com sugestões clicáveis */}
      <div className={cn(!compact && "md:col-span-2")}>
        <Label>Bairro</Label>
        <Input
          value={value.neighborhood}
          onChange={(e) =>
            onChange({ ...value, neighborhood: e.target.value })
          }
          placeholder={
            value.city
              ? "Digite o bairro ou escolha uma sugestão"
              : "Selecione cidade primeiro"
          }
        />
        {neighborhoodSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 items-center">
            <span className="text-xs text-muted-foreground">Sugestões:</span>
            {neighborhoodSuggestions.map((n) => {
              const active = value.neighborhood === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange({ ...value, neighborhood: n })}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full border transition-colors",
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card hover:bg-accent hover:text-accent-foreground border-border",
                  )}
                >
                  {n}
                </button>
              );
            })}
          </div>
        )}
        {value.city && neighborhoodSuggestions.length === 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Sem sugestões para esta cidade — preencha o bairro à mão.
          </p>
        )}
      </div>
    </div>
  );
}
