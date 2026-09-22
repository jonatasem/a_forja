import { prisma } from "../../prisma/index.js";

export interface ListWorkLoadProps {
  barberId: string;
  serviceIds: string[];
  date: string; // Formato: "YYYY-MM-DD"
  slotStep?: number; // Intervalo de grade em minutos entre os horários gerados (padrão 30 min)
}

// Representa um intervalo bloqueado no tempo em minutos a partir das 00:00 do dia
interface OccupiedInterval {
  start: number;
  end: number;
}

/**
 * Converte o horário no formato "HH:mm" em total de minutos a partir das 00:00.
 */
function timeToMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Converte minutos a partir de 00:00 de volta para a string formatada "HH:mm".
 */
function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export class ListWorkLoadService {
  /**
   * Calcula e retorna uma lista de horários disponíveis ("HH:mm") para o barbeiro no dia informado,
   * levando em consideração a soma da duração dos serviços escolhidos.
   */
  async execute({ barberId, serviceIds, date, slotStep = 30 }: ListWorkLoadProps) {
    // 1. Valida existência do barbeiro
    const barber = await prisma.user.findUnique({ where: { id: barberId } });
    if (!barber || barber.role !== "BARBER") {
      throw new Error("Barbeiro não encontrado.");
    }

    // 2. Busca e valida os serviços selecionados
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        active: true,
      },
    });

    if (services.length !== serviceIds.length) {
      throw new Error("Um ou mais serviços selecionados estão inativos ou não existem.");
    }

    // Soma a duração total dos serviços
    const totalDuration = services.reduce((acc, service) => acc + service.duration, 0);

    // Parse manual da string de data no formato "YYYY-MM-DD"
    const [yearStr, monthStr, dayStr] = date.split("-");
    if (!yearStr || !monthStr || !dayStr) {
      throw new Error("Data inválida. Use o formato YYYY-MM-DD.");
    }

    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    const searchDate = new Date(year, month - 1, day);
    const dayOfWeek = searchDate.getDay();

    // 3. Busca a jornada de trabalho do barbeiro no dia da semana
    const workingHour = await prisma.workLoad.findFirst({
      where: { barberId, dayOfWeek, active: true },
    });

    // Se o barbeiro não atende neste dia, retorna lista vazia
    if (!workingHour) return [];

    const workStartMinutes = timeToMinutes(workingHour.startTime);
    const workEndMinutes = timeToMinutes(workingHour.endTime);
    const breakStartMinutes = workingHour.breakStart ? timeToMinutes(workingHour.breakStart) : null;
    const breakEndMinutes = workingHour.breakEnd ? timeToMinutes(workingHour.breakEnd) : null;

    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    // 4. Busca agendamentos ativos marcados para este dia
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

    // 5. Busca bloqueios de agenda que coincidem com a data
    const scheduleBlocks = await prisma.timeOff.findMany({
      where: {
        barberId,
        startTime: { lte: endOfDay },
        endTime: { gte: startOfDay },
      },
    });

    const occupiedIntervals: OccupiedInterval[] = [];

    // Mapeia os agendamentos existentes para intervalos ocupados em minutos
    existingAppointments.forEach((app) => {
      const appDate = new Date(app.date);
      const start = appDate.getHours() * 60 + appDate.getMinutes();
      const appTotalDuration = app.services.reduce((acc, s) => acc + s.duration, 0);
      const end = start + appTotalDuration;
      occupiedIntervals.push({ start, end });
    });

    // Mapeia os bloqueios (TimeOff) ajustando os minutos em relação às 00:00 do dia pesquisado
    const startOfDayMs = startOfDay.getTime();
    scheduleBlocks.forEach((block) => {
      const blockStartMs = new Date(block.startTime).getTime();
      const blockEndMs = new Date(block.endTime).getTime();

      const start = Math.max(0, Math.floor((blockStartMs - startOfDayMs) / 60000));
      const end = Math.min(1440, Math.ceil((blockEndMs - startOfDayMs) / 60000));

      occupiedIntervals.push({ start, end });
    });

    // Identifica se a busca é para o dia de hoje (para filtrar horários que já passaram)
    const now = new Date();
    const isToday =
      searchDate.getFullYear() === now.getFullYear() &&
      searchDate.getMonth() === now.getMonth() &&
      searchDate.getDate() === now.getDate();

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const availableHours: string[] = [];

    // 6. Varre a jornada do barbeiro em passos (ex: de 30 em 30 min) testando se a janela inteira do serviço cabe no horário
    for (
      let current = workStartMinutes;
      current + totalDuration <= workEndMinutes;
      current += slotStep
    ) {
      const slotStart = current;
      const slotEnd = current + totalDuration;

      // Se for o dia atual, desconsidera horários retroativos
      if (isToday && slotStart <= currentMinutes) {
        continue;
      }

      // Desconsidera horários que interceptem o intervalo/almoço
      if (breakStartMinutes !== null && breakEndMinutes !== null) {
        if (slotStart < breakEndMinutes && slotEnd > breakStartMinutes) {
          continue;
        }
      }

      // Desconsidera horários que tenham sobreposição com agendamentos ou bloqueios
      const hasConflict = occupiedIntervals.some(
        (interval) => slotStart < interval.end && slotEnd > interval.start
      );

      // Se passou por todas as regras, o horário está liberado
      if (!hasConflict) {
        availableHours.push(minutesToTime(slotStart));
      }
    }

    return availableHours;
  }
}