import { useState } from "react";
import { format, startOfWeek, addDays, isSameDay, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const today = () => startOfDay(new Date());

function getStatusColor(status: string, bookingDate: string) {
  const isPast = isBefore(new Date(bookingDate + "T23:59:59"), today());

  if (isPast && status !== "cancelled") {
    return "bg-muted/60 border-border text-muted-foreground";
  }

  const colors: Record<string, string> = {
    pending: "bg-yellow-500/20 border-yellow-500/40 text-yellow-700 dark:text-yellow-400",
    confirmed: "bg-green-500/20 border-green-500/40 text-green-700 dark:text-green-400",
    cancelled: "bg-red-500/20 border-red-500/40 text-red-700 dark:text-red-400",
  };
  return colors[status] ?? "bg-muted border-border";
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

interface WeeklyCalendarViewProps {
  bookings: any[];
  onUpdateStatus: (id: string, status: string) => void;
  isProfessional: boolean;
}

export function WeeklyCalendarView({ bookings, onUpdateStatus, isProfessional }: WeeklyCalendarViewProps) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getBookingsForSlot = (day: Date, hour: number) => {
    return bookings.filter((b) => {
      const bDate = new Date(b.booking_date + "T00:00:00");
      const bHour = parseInt(b.booking_time?.split(":")[0] ?? "0", 10);
      return isSameDay(bDate, day) && bHour === hour;
    });
  };

  const prevWeek = () => setWeekStart((d) => addDays(d, -7));
  const nextWeek = () => setWeekStart((d) => addDays(d, 7));
  const goToday = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const isCurrentDay = (day: Date) => isSameDay(day, new Date());

  return (
    <div className="space-y-3">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {format(days[0], "dd MMM", { locale: ptBR })} — {format(days[6], "dd MMM yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto border rounded-lg">
        <div className="min-w-[800px]">
          {/* Header row */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b bg-muted/30">
            <div className="p-2 text-xs text-muted-foreground font-medium text-center">Hora</div>
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "p-2 text-center border-l",
                  isCurrentDay(day) && "bg-primary/10"
                )}
              >
                <p className="text-xs text-muted-foreground uppercase">
                  {format(day, "EEE", { locale: ptBR })}
                </p>
                <p className={cn(
                  "text-sm font-semibold",
                  isCurrentDay(day) && "text-primary"
                )}>
                  {format(day, "dd")}
                </p>
              </div>
            ))}
          </div>

          {/* Time slots */}
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b last:border-b-0 min-h-[52px]">
              <div className="p-1 text-xs text-muted-foreground text-center flex items-start justify-center pt-2 border-r bg-muted/10">
                {String(hour).padStart(2, "0")}:00
              </div>
              {days.map((day) => {
                const slotBookings = getBookingsForSlot(day, hour);
                return (
                  <div
                    key={day.toISOString() + hour}
                    className={cn(
                      "border-l p-0.5 min-h-[52px]",
                      isCurrentDay(day) && "bg-primary/5"
                    )}
                  >
                    {slotBookings.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBooking(b)}
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[11px] leading-tight border cursor-pointer mb-0.5 truncate active:scale-95 transition-transform",
                          getStatusColor(b.status, b.booking_date)
                        )}
                      >
                        <span className="font-medium">{b.booking_time?.slice(0, 5)}</span>
                        {" "}
                        <span className="truncate">{b.client_name}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Booking detail dialog (works on tablet/touch) */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="max-w-sm">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedBooking.client_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                {selectedBooking.client_phone && <p>📞 {selectedBooking.client_phone}</p>}
                {selectedBooking.client_email && <p>📧 {selectedBooking.client_email}</p>}
                <p>🕐 {selectedBooking.booking_time?.slice(0, 5)} — {new Date(selectedBooking.booking_date + "T00:00:00").toLocaleDateString("pt-BR")}</p>
                <p>💇 {(selectedBooking.services as any)?.name ?? "Sem serviço"}</p>
                {!isProfessional && <p>👤 Prof: {(selectedBooking.professionals as any)?.name ?? "—"}</p>}
                <Badge variant="outline">
                  {STATUS_LABELS[selectedBooking.status] ?? selectedBooking.status}
                </Badge>
                <div className="flex gap-2 pt-2">
                  {selectedBooking.status !== "confirmed" && selectedBooking.status !== "cancelled" && (
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                      onUpdateStatus(selectedBooking.id, "confirmed");
                      setSelectedBooking(null);
                    }}>
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Confirmar
                    </Button>
                  )}
                  {selectedBooking.status !== "cancelled" && (
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                      onUpdateStatus(selectedBooking.id, "cancelled");
                      setSelectedBooking(null);
                    }}>
                      <XCircle className="w-3.5 h-3.5 text-red-600" /> Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
