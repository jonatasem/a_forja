import { prisma } from "../../prisma/index.js";
import type { Prisma } from "@prisma/client";

export interface ListAvailableHoursDTO {
  barberId: string;
  serviceId: string;
  date: string; // Formato: "YYYY-MM-DD"
}

type AppointmentWithService = Prisma.AppointmentGetPayload<{
  include: { service: true };
}>;

interface OccupiedInterval {
  start: number;
  end: number;
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
  async execute({ barberId, serviceId, date }: ListAvailableHoursDTO) {
    const barber = await prisma.user.findUnique({ where: { id: barberId } });
    if (!barber || barber.role !== "barber") throw new Error("Barbeiro não encontrado.");

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.active) throw new Error("Serviço inativo ou inexistente.");

    const [yearStr, monthStr, dayStr] = date.split("-");
    if (!yearStr || !monthStr || !dayStr) throw new Error("Data inválida. Use o formato YYYY-MM-DD.");

    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    const searchDate = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = searchDate.getUTCDay();

    const workingHour = await prisma.workingHours.findFirst({
      where: { barberId, dayOfWeek, active: true },
    });

    if (!workingHour) return [];

    const workStartMinutes = timeToMinutes(workingHour.startTime);
    const workEndMinutes = timeToMinutes(workingHour.endTime);
    const breakStartMinutes = workingHour.breakStart ? timeToMinutes(workingHour.breakStart) : null;
    const breakEndMinutes = workingHour.breakEnd ? timeToMinutes(workingHour.breakEnd) : null;

    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        barberId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: "CANCELED" },
      },
      include: { service: true },
    });

    const occupiedIntervals: OccupiedInterval[] = existingAppointments.map(
      (app: AppointmentWithService) => {
        const appDate = new Date(app.date);
        const start = appDate.getUTCHours() * 60 + appDate.getUTCMinutes();
        const end = start + app.service.duration;
        return { start, end };
      }
    );

    const now = new Date();
    const isToday = searchDate.toISOString().slice(0, 10) === now.toISOString().slice(0, 10);
    const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

    const slotStep = 30;
    const serviceDuration = service.duration;
    const availableHours: string[] = [];

    for (let current = workStartMinutes; current + serviceDuration <= workEndMinutes; current += slotStep) {
      const slotStart = current;
      const slotEnd = current + serviceDuration;

      if (isToday && slotStart <= currentMinutes) {
        continue;
      }

      if (breakStartMinutes !== null && breakEndMinutes !== null) {
        if (slotStart < breakEndMinutes && slotEnd > breakStartMinutes) {
          continue;
        }
      }

      const hasConflict = occupiedIntervals.some(
        (interval: OccupiedInterval) => slotStart < interval.end && slotEnd > interval.start
      );

      if (!hasConflict) {
        availableHours.push(minutesToTime(slotStart));
      }
    }

    return availableHours;
  }
}