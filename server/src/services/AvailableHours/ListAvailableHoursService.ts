import { prisma } from "../../prisma/index.js";

export interface ListAvailableHoursDTO {
  barberId: string;
  serviceIds: string[];
  date: string; // Formato: "YYYY-MM-DD"
  slotStep?: number; // Padrão: 30 minutos
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
  async execute({ barberId, serviceIds, date, slotStep = 30 }: ListAvailableHoursDTO) {
    const barber = await prisma.user.findUnique({ where: { id: barberId } });
    if (!barber || barber.role !== "BARBER") {
      throw new Error("Barbeiro não encontrado.");
    }

    // Busca todos os serviços solicitados
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        active: true,
      },
    });

    if (services.length !== serviceIds.length) {
      throw new Error("Um ou mais serviços selecionados estão inativos ou não existem.");
    }

    // SOMA TOTAL DA DURAÇÃO DOS SERVIÇOS
    const totalDuration = services.reduce((acc, service) => acc + service.duration, 0);

    const [yearStr, monthStr, dayStr] = date.split("-");
    if (!yearStr || !monthStr || !dayStr) {
      throw new Error("Data inválida. Use o formato YYYY-MM-DD.");
    }

    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    const searchDate = new Date(year, month - 1, day);
    const dayOfWeek = searchDate.getDay();

    const workingHour = await prisma.workLoad.findFirst({
      where: { barberId, dayOfWeek, active: true },
    });

    if (!workingHour) return [];

    const workStartMinutes = timeToMinutes(workingHour.startTime);
    const workEndMinutes = timeToMinutes(workingHour.endTime);
    const breakStartMinutes = workingHour.breakStart ? timeToMinutes(workingHour.breakStart) : null;
    const breakEndMinutes = workingHour.breakEnd ? timeToMinutes(workingHour.breakEnd) : null;

    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    // 1. Busca agendamentos (Ajustado para relacionamentos N:N `services`)
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        barberId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: "CANCELED" },
      },
      select: {
        date: true,
        services: { select: { duration: true } },
      },
    });

    // 2. Busca bloqueios na agenda
    const scheduleBlocks = await prisma.timeOff.findMany({
      where: {
        barberId,
        startTime: { lte: endOfDay },
        endTime: { gte: startOfDay },
      },
    });

    const occupiedIntervals: OccupiedInterval[] = [];

    // Mapeia agendamentos somando a duração dos seus serviços
    existingAppointments.forEach((app) => {
      const appDate = new Date(app.date);
      const start = appDate.getHours() * 60 + appDate.getMinutes();
      const appTotalDuration = app.services.reduce((acc, s) => acc + s.duration, 0);
      const end = start + appTotalDuration;
      occupiedIntervals.push({ start, end });
    });

    // Mapeia bloqueios
    scheduleBlocks.forEach((block) => {
      const blockStart = new Date(block.startTime);
      const blockEnd = new Date(block.endTime);
      const start = blockStart.getHours() * 60 + blockStart.getMinutes();
      const end = blockEnd.getHours() * 60 + blockEnd.getMinutes();
      occupiedIntervals.push({ start, end });
    });

    const now = new Date();
    const isToday =
      searchDate.getFullYear() === now.getFullYear() &&
      searchDate.getMonth() === now.getMonth() &&
      searchDate.getDate() === now.getDate();

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const availableHours: string[] = [];

    // Percorre os horários verificando a janela total de tempo necessária
    for (
      let current = workStartMinutes;
      current + totalDuration <= workEndMinutes;
      current += slotStep
    ) {
      const slotStart = current;
      const slotEnd = current + totalDuration;

      // Ignora horários passados do dia atual
      if (isToday && slotStart <= currentMinutes) {
        continue;
      }

      // Valida interseção com pausa/almoço do barbeiro
      if (breakStartMinutes !== null && breakEndMinutes !== null) {
        if (slotStart < breakEndMinutes && slotEnd > breakStartMinutes) {
          continue;
        }
      }

      // Valida conflitos com agendamentos existentes ou bloqueios
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