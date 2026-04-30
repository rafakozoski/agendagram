import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CheckCircle, Clock, XCircle, Loader2, Users, Building2, List, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { ManualBookingDialog } from "./ManualBookingDialog";
import { WeeklyCalendarView } from "./WeeklyCalendarView";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  confirmed: { label: "Confirmado", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

export function BusinessBookingsTab() {
  const queryClient = useQueryClient();
  const { business, isLoading: bizLoading, isProfessional, professionalId } = useMyBusiness();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [professionalFilter, setProfessionalFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const { data: professionals = [] } = useQuery({
    queryKey: ["biz-professionals-list", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data, error } = await supabase
        .from("professionals")
        .select("id, name")
        .eq("business_id", business.id)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["business-bookings", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select("*, services(name, price), professionals(name)")
        .eq("business_id", business.id)
        .order("booking_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-bookings"] });
      toast.success("Status atualizado");
    },
  });

  // If user is a professional, force filter to their own bookings
  const effectiveProfessionalFilter = isProfessional ? professionalId : professionalFilter;

  const filtered = bookings.filter((b) => {
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchProfessional = effectiveProfessionalFilter === "all" || b.professional_id === effectiveProfessionalFilter;
    return matchStatus && matchProfessional;
  });

  if (bizLoading || isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (!business) {
    return <p className="text-muted-foreground text-center py-12">Configure sua empresa primeiro na aba "Minha Empresa".</p>;
  }

  const stats = {
    total: filtered.length,
    pending: filtered.filter((b) => b.status === "pending").length,
    confirmed: filtered.filter((b) => b.status === "confirmed").length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats.total}</div><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-yellow-600">{stats.pending}</div><p className="text-xs text-muted-foreground">Pendentes</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-600">{stats.confirmed}</div><p className="text-xs text-muted-foreground">Confirmados</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3">
          <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Agenda</CardTitle>
          <div className="flex gap-2 flex-wrap items-center">
            <ManualBookingDialog businessId={business.id} />
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-none gap-1.5"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" /> Lista
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                className="rounded-none gap-1.5"
                onClick={() => setViewMode("calendar")}
              >
                <CalendarDays className="w-4 h-4" /> Semana
              </Button>
            </div>
            {/* Professional filter - only show for owners, not professionals */}
            {!isProfessional && professionals.length > 1 && (
              <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
                <SelectTrigger className="w-48">
                  <Building2 className="w-4 h-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> Todos profissionais
                    </span>
                  </SelectItem>
                  {professionals.map((pro) => (
                    <SelectItem key={pro.id} value={pro.id}>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {pro.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="confirmed">Confirmados</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isProfessional && (
            <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-primary font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Visualizando apenas sua agenda pessoal
              </p>
            </div>
          )}

          {viewMode === "calendar" ? (
            <WeeklyCalendarView
              bookings={filtered}
              onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
              isProfessional={isProfessional}
            />
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma reserva encontrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    {!isProfessional && <TableHead>Profissional</TableHead>}
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.client_name}</p>
                          <p className="text-xs text-muted-foreground">{booking.client_email}</p>
                          <p className="text-xs text-muted-foreground">{booking.client_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{(booking.services as any)?.name ?? "—"}</TableCell>
                      {!isProfessional && <TableCell>{(booking.professionals as any)?.name ?? "—"}</TableCell>}
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {new Date(booking.booking_date + "T00:00:00").toLocaleDateString("pt-BR")}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />{booking.booking_time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_MAP[booking.status]?.variant ?? "outline"}>
                          {STATUS_MAP[booking.status]?.label ?? booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {booking.status !== "confirmed" && booking.status !== "cancelled" && (
                            <Button size="icon" variant="ghost" onClick={() => updateStatus.mutate({ id: booking.id, status: "confirmed" })} title="Confirmar">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          {booking.status !== "cancelled" && (
                            <Button size="icon" variant="ghost" onClick={() => updateStatus.mutate({ id: booking.id, status: "cancelled" })} title="Cancelar">
                              <XCircle className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
