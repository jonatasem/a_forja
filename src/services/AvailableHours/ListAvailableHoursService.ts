import { prisma } from "../../prisma/index.js";

export interface ListAvailableHoursDTO {
  barberId: string;
  serviceId: string;
  date: string; // Formato: "YYYY-MM-DD"
  slotStep?: number; // Intervalo entre horários em minutos (padrão: 30)
}

interface OccupiedInterval {
  start: number;
  end: number;
}

function timeToMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export class ListAvailableHoursService {
  async execute({ barberId, serviceId, date, slotStep = 30 }: ListAvailableHoursDTO) {
    const barber = await prisma.user.findUnique({ where: { id: barberId } });
    if (!barber || barber.role !== "barber") {
      throw new Error("Barbeiro não encontrado.");
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.active) {
      throw new Error("Serviço inativo ou inexistente.");
    }

    const [yearStr, monthStr, dayStr] = date.split("-");
    if (!yearStr || !monthStr || !dayStr) {
      throw new Error("Data inválida. Use o formato YYYY-MM-DD.");
    }

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

    // 1. Busca os agendamentos existentes
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        barberId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: "CANCELED" },
      },
      select: {
        date: true,
        service: { select: { duration: true } },
      },
    });

    // 2. Busca os bloqueios de agenda (ScheduleBlock)
    const scheduleBlocks = await prisma.scheduleBlock.findMany({
      where: {
        barberId,
        startTime: { lte: endOfDay },
        endTime: { gte: startOfDay },
      },
    });

    const occupiedIntervals: OccupiedInterval[] = [];

    // Adiciona intervalos ocupados pelos agendamentos
    existingAppointments.forEach((app) => {
      const appDate = new Date(app.date);
      const start = appDate.getUTCHours() * 60 + appDate.getUTCMinutes();
      const end = start + app.service.duration;
      occupiedIntervals.push({ start, end });
    });

    // Adiciona intervalos ocupados pelos bloqueios
    scheduleBlocks.forEach((block) => {
      const blockStart = new Date(block.startTime);
      const blockEnd = new Date(block.endTime);
      const start = blockStart.getUTCHours() * 60 + blockStart.getUTCMinutes();
      const end = blockEnd.getUTCHours() * 60 + blockEnd.getUTCMinutes();
      occupiedIntervals.push({ start, end });
    });

    const now = new Date();
    const isToday = searchDate.toISOString().slice(0, 10) === now.toISOString().slice(0, 10);
    const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

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
        (interval) => slotStart < interval.end && slotEnd > interval.start
      );

      if (!hasConflict) {
        availableHours.push(minutesToTime(slotStart));
      }
    }

    return availableHours;
  }
}