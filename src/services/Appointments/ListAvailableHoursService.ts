import { prisma } from "../../prisma/index.js";

export interface ListAvailableHoursProps {
  barberId: string;
  serviceId: string;
  date: string; // Formato: "YYYY-MM-DD"
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export class ListAvailableHoursService {
  async execute({ barberId, serviceId, date }: ListAvailableHoursProps) {
    const barber = await prisma.user.findUnique({ where: { id: barberId } });
    if (!barber || barber.role !== "barber") throw new Error("Barbeiro não encontrado.");

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.active) throw new Error("Serviço inativo ou inexistente.");

    const [yearStr, monthStr, dayStr] = date.split("-");
    if (!yearStr || !monthStr || !dayStr) throw new Error("Data inválida. Use o formato YYYY-MM-DD.");

    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    const searchDate = new Date(year, month - 1, day);
    const dayOfWeek = searchDate.getDay();

    const workingHour = await prisma.workingHours.findFirst({
      where: { barberId, dayOfWeek, active: true },
    });

    if (!workingHour) return [];

    const workStartMinutes = timeToMinutes(workingHour.startTime);
    const workEndMinutes = timeToMinutes(workingHour.endTime);
    const breakStartMinutes = workingHour.breakStart ? timeToMinutes(workingHour.breakStart) : null;
    const breakEndMinutes = workingHour.breakEnd ? timeToMinutes(workingHour.breakEnd) : null;

    const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        barberId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: "CANCELED" },
      },
      include: { service: true },
    });

    const occupiedIntervals = existingAppointments.map((app) => {
      const appDate = new Date(app.date);
      const start = appDate.getHours() * 60 + appDate.getMinutes();
      const end = start + app.service.duration;
      return { start, end };
    });

    const now = new Date();
    const isToday = searchDate.toDateString() === now.toDateString();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const slotStep = 30;
    const serviceDuration = service.duration;
    const availableHours: string[] = [];

    for (let current = workStartMinutes; current + serviceDuration <= workEndMinutes; current += slotStep) {
      const slotStart = current;
      const slotEnd = current + serviceDuration;

      // Descarta horários que já passaram caso a busca seja para hoje
      if (isToday && slotStart <= currentMinutes) {
        continue;
      }

      if (breakStartMinutes !== null && breakEndMinutes !== null) {
        if (slotStart < breakEndMinutes && slotEnd > breakStartMinutes) {
          continue;
        }
      }

      const hasConflict = occupiedIntervals.some(
        (interval) => slotStart < interval.end && slotEnd > interval.start
      );

      if (!hasConflict) {
        availableHours.push(minutesToTime(slotStart));
      }
    }

    return availableHours;
  }
}