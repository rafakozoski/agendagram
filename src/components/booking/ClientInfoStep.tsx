import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Loader2, UserPlus, UserCheck } from "lucide-react";
import { useState } from "react";

interface Props {
  info: { name: string; email: string; phone: string; notes: string };
  onChange: (info: { name: string; email: string; phone: string; notes: string }) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting?: boolean;
}

export function ClientInfoStep({ info, onChange, onSubmit, onBack, submitting }: Props) {
  const [visitType, setVisitType] = useState<"first" | "return">("first");
  const valid = info.name.trim() && info.email.includes("@") && info.phone.trim().length >= 8;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-semibold">Seus dados</h3>
      </div>
      <div className="space-y-4 max-w-md mx-auto">
        {/* Visit type selector */}
        <div>
          <Label className="mb-2 block">Tipo de visita</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setVisitType("first")}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                visitType === "first"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Primeira visita
            </button>
            <button
              type="button"
              onClick={() => setVisitType("return")}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                visitType === "return"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Retorno
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" placeholder="Seu nome" value={info.name} onChange={(e) => onChange({ ...info, name: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="seu@email.com" value={info.email} onChange={(e) => onChange({ ...info, email: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" type="tel" placeholder="(11) 99999-9999" value={info.phone} onChange={(e) => onChange({ ...info, phone: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="notes">Observações (opcional)</Label>
          <Textarea
            id="notes"
            placeholder={visitType === "first" ? "Ex: É minha primeira avaliação, gostaria de..." : "Ex: Retorno da consulta anterior, acompanhamento de..."}
            value={info.notes}
            onChange={(e) => onChange({ ...info, notes: e.target.value })}
            rows={3}
          />
        </div>
        <Button
          onClick={onSubmit}
          disabled={!valid || submitting}
          className="w-full gradient-primary text-primary-foreground shadow-glow mt-4"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
          Confirmar agendamento
        </Button>
      </div>
    </div>
  );
}
