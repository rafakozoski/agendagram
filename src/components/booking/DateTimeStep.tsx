import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft } from "lucide-react";
import { generateTimeSlots } from "@/lib/scheduling";

interface Props {
  selectedDate: Date | undefined;
  selectedTime: string | null;
  onSelectDate: (d: Date | undefined) => void;
  onSelectTime: (t: string) => void;
  onBack: () => void;
  businessId?: string;
  professionalId?: string | null;
}

export function DateTimeStep({ selectedDate, selectedTime, onSelectDate, onSelectTime, onBack, businessId, professionalId }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: availability = [] } = useQuery({
    queryKey: ["availability", businessId],
    queryFn: async () => {
      let query = supabase.from("availability").select("*");
      if (businessId) query = query.eq("business_id", businessId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const dateStr = selectedDate ? selectedDate.toISOString().split("T")[0] : null;

  // Fetch existing bookings for selected date to block taken slots
  const { data: existingBookings = [] } = useQuery({
    queryKey: ["date-bookings", dateStr, businessId, professionalId],
    queryFn: async () => {
      if (!dateStr) return [];
      const { data, error } = await supabase.rpc("get_booked_times", {
        _booking_date: dateStr,
        _business_id: businessId || null,
        _professional_id: professionalId || null,
      });
      if (error) throw error;
      return (data || []).map((r: any) => ({ booking_time: r.booking_time }));
    },
    enabled: !!dateStr,
  });

  const disabledDays = availability.filter((a) => !a.enabled).map((a) => a.day_of_week);

  const selectedDayAvail = selectedDate
    ? availability.find((a) => a.day_of_week === selectedDate.getDay() && a.enabled)
    : null;

  const bookedTimes = existingBookings.map((b) => b.booking_time);

  const slots = selectedDayAvail
    ? generateTimeSlots(selectedDayAvail.start_time, selectedDayAvail.end_time, 30, bookedTimes)
    : [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-semibold">Escolha data e horário</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onSelectDate}
            disabled={(date) => {
              const d = new Date(date);
              d.setHours(0, 0, 0, 0);
              return d < today || disabledDays.includes(date.getDay());
            }}
            className="rounded-lg border"
          />
        </div>
        <div>
          {!selectedDate ? (
            <p className="text-muted-foreground text-center py-8">Selecione uma data</p>
          ) : slots.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Sem horários disponíveis neste dia</p>
          ) : (
            <div>
              <p className="text-sm font-medium mb-3 text-muted-foreground">
                Horários para {selectedDate.toLocaleDateString('pt-BR')}
              </p>
              <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => onSelectTime(slot.time)}
                    className={`py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      !slot.available
                        ? "bg-muted text-muted-foreground/40 cursor-not-allowed line-through"
                        : selectedTime === slot.time
                        ? "gradient-primary text-primary-foreground shadow-glow"
                        : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
