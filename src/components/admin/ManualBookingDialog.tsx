import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ManualBookingDialogProps {
  businessId: string;
}

export function ManualBookingDialog({ businessId }: ManualBookingDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");

  const { data: services = [] } = useQuery({
    queryKey: ["manual-bk-services", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, price, duration")
        .eq("business_id", businessId)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: professionals = [] } = useQuery({
    queryKey: ["manual-bk-professionals", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professionals")
        .select("id, name")
        .eq("business_id", businessId)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const h = Math.floor(i / 2) + 7;
    const m = i % 2 === 0 ? "00" : "30";
    return `${String(h).padStart(2, "0")}:${m}`;
  });

  const createBooking = useMutation({
    mutationFn: async () => {
      if (!date) throw new Error("Data obrigatória");
      const { error } = await supabase.from("bookings").insert({
        business_id: businessId,
        client_name: clientName.trim(),
        client_email: clientEmail.trim(),
        client_phone: clientPhone.trim(),
        service_id: serviceId || null,
        professional_id: professionalId || null,
        booking_date: format(date, "yyyy-MM-dd"),
        booking_time: time,
        status: "confirmed",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-bookings"] });
      toast.success("Agendamento criado com sucesso!");
      resetForm();
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error("Erro ao criar agendamento: " + err.message);
    },
  });

  const resetForm = () => {
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setServiceId("");
    setProfessionalId("");
    setDate(undefined);
    setTime("");
  };

  const canSubmit = clientName.trim() && date && time;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Agendamento Manual</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nome do cliente *</Label>
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nome completo" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="(11) 99999-0000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Serviço</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger><SelectValue placeholder="Selecionar serviço" /></SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — R$ {Number(s.price).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Profissional</Label>
            <Select value={professionalId} onValueChange={setProfessionalId}>
              <SelectTrigger><SelectValue placeholder="Selecionar profissional" /></SelectTrigger>
              <SelectContent>
                {professionals.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} locale={ptBR} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Horário *</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger><SelectValue placeholder="Horário" /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full" disabled={!canSubmit || createBooking.isPending} onClick={() => createBooking.mutate()}>
            {createBooking.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Criar Agendamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
