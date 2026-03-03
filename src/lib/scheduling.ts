export interface Service {
  id: string;
  name: string;
  type: 'service' | 'product';
  price: number;
  duration: number;
  description: string;
}

export interface Professional {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  services: string[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceId: string;
  professionalId: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export function generateTimeSlots(
  start: string,
  end: string,
  intervalMinutes: number,
  bookedTimes: string[] = []
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  let current = startH * 60 + startM;
  const endMin = endH * 60 + endM;

  while (current < endMin) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    const time = `${h}:${m}`;
    const isBooked = bookedTimes.some((bt) => bt.startsWith(time));
    slots.push({ time, available: !isBooked });
    current += intervalMinutes;
  }
  return slots;
}
