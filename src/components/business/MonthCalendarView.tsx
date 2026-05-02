import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

const STATUS_DOT: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-green-500",
  cancelled: "bg-red-500",
};

interface Props {
  bookings: any[];
  onUpdateStatus: (id: string, status: string) => void;
  isProfessional: boolean;
}

export function MonthCalendarView({ bookings, onUpdateStatus, isProfessional }: Props) {
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    const out: Date[] = [];
    let d = start;
    while (d <= end) {
      out.push(d);
      d = addDays(d, 1);
    }
    return out;
  }, [cursor]);

  const bookingsByDay = useMemo(() => {
    const map: Record<string, any[]> = {};
    bookings.forEach((b) => {
      const k = b.booking_date;
      if (!map[k]) map[k] = [];
      map[k].push(b);
    });
    return map;
  }, [bookings]);

  const dayKey = (d: Date) => format(d, "yyyy-MM-dd");
  const today = new Date();

  const dayBookings = selectedDay
    ? (bookingsByDay[dayKey(selectedDay)] ?? []).sort((a, b) =>
        (a.booking_time ?? "").localeCompare(b.booking_time ?? ""),
      )
    : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setCursor((d) => subMonths(d, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <p className="text-sm font-medium capitalize">
          {format(cursor, "MMMM yyyy", { locale: ptBR })}
        </p>
        <Button variant="outline" size="icon" onClick={() => setCursor((d) => addMonths(d, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-muted/30 text-[10px] uppercase text-muted-foreground">
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
            <div key={d} className="p-1.5 text-center font-medium">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d) => {
            const list = bookingsByDay[dayKey(d)] ?? [];
            const inMonth = isSameMonth(d, cursor);
            const isToday = isSameDay(d, today);
            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelectedDay(d)}
                className={cn(
                  "min-h-[56px] sm:min-h-[72px] p-1 border-t border-l text-left transition-colors first:border-l-0 hover:bg-accent/30",
                  !inMonth && "bg-muted/20 text-muted-foreground/50",
                  isToday && "bg-primary/10",
                )}
              >
                <div className={cn("text-xs font-medium", isToday && "text-primary")}>
                  {format(d, "d")}
                </div>
                {list.length > 0 && (
                  <div className="mt-0.5 space-y-0.5">
                    <div className="flex gap-0.5 flex-wrap">
                      {Array.from(new Set(list.map((b) => b.status)))
                        .slice(0, 3)
                        .map((s) => (
                          <span
                            key={s}
                            className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[s] ?? "bg-muted")}
                          />
                        ))}
                    </div>
                    <div className="text-[10px] text-muted-foreground leading-none">
                      {list.length} {list.length === 1 ? "ag." : "ags."}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Dialog open={!!selectedDay} onOpenChange={(o) => !o && setSelectedDay(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && format(selectedDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </DialogTitle>
          </DialogHeader>
          {dayBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum agendamento neste dia.
            </p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {dayBookings.map((b) => (
                <div key={b.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate text-sm">{b.client_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(b.services as any)?.name ?? "—"}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {STATUS_LABELS[b.status] ?? b.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" /> {b.booking_time?.slice(0, 5)}
                    {!isProfessional && (b.professionals as any)?.name && (
                      <span className="truncate">· {(b.professionals as any).name}</span>
                    )}
                  </div>
                  {b.status !== "cancelled" && (
                    <div className="flex gap-1.5 pt-1">
                      {b.status !== "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 gap-1"
                          onClick={() => onUpdateStatus(b.id, "confirmed")}
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Confirmar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 gap-1"
                        onClick={() => onUpdateStatus(b.id, "cancelled")}
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-600" /> Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
