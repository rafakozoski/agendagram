import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

interface Props {
  info: { name: string; email: string; phone: string };
  onChange: (info: { name: string; email: string; phone: string }) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting?: boolean;
}

export function ClientInfoStep({ info, onChange, onSubmit, onBack, submitting }: Props) {
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
