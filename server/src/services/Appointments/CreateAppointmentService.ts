import { prisma } from "../../prisma/index.js";

export interface CreateAppointmentProps {
  clientId: string;
  barberId: string;
  serviceIds: string[];
  date: string | Date;
}

// Converte o horário no formato string "HH:mm" em total de minutos a partir de 00:00. Exemplo: "01:30" -> 90 minutos.
function timeToMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export class CreateAppointmentService {
  async execute({ clientId, barberId, serviceIds, date }: CreateAppointmentProps) {
    let year: number, month: number, day: number, hours: number, minutes: number;

    // Extração manual das partes da data para evitar distorção de fuso horário
    if (typeof date === "string") {
      const [datePart, timePart = "00:00"] = date.split(/[T ]/);
      const [y, m, d] = (datePart ?? "").split("-").map(Number);
      const [h, min] = (timePart ?? "").split(":").map(Number);

      year = y ?? 0;
      month = (m ?? 1) - 1; // Mês no JS começa em 0 (Janeiro = 0, Fevereiro = 1, etc.)
      day = d ?? 1;
      hours = h ?? 0;
      minutes = min ?? 0;
    } else {
      year = date.getFullYear();
      month = date.getMonth();
      day = date.getDate();
      hours = date.getHours();
      minutes = date.getMinutes();
    }

    const appointmentDate = new Date(year, month, day, hours, minutes);

    // Validações básicas da data fornecida
    if (isNaN(appointmentDate.getTime())) {
      throw new Error("Data ou horário fornecido é inválido.");
    }

    if (appointmentDate < new Date()) {
      throw new Error("Não é possível criar agendamentos em datas passadas.");
    }

    // Valida se o cliente existe no banco de dados
    const client = await prisma.user.findUnique({ where: { id: clientId } });
    if (!client) throw new Error("Cliente não encontrado.");

    // Valida se o barbeiro existe e possui a role correta
    const barber = await prisma.user.findUnique({ where: { id: barberId } });
    if (!barber || barber.role !== "BARBER") throw new Error("Barbeiro não encontrado.");

    // Busca os serviços solicitados que estejam ativos
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        active: true,
      },
    });

    if (services.length !== serviceIds.length) {
      throw new Error("Um ou mais serviços selecionados estão inativos ou não existem.");
    }

    // Soma a duração individual de todos os serviços selecionados
    const totalDuration = services.reduce((acc, s) => acc + s.duration, 0);

    const dayOfWeek = appointmentDate.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const appStartMinutes = hours * 60 + minutes;
    const appEndMinutes = appStartMinutes + totalDuration;

    // Busca o expediente cadastrado para o barbeiro neste dia da semana
    const workingHour = await prisma.workLoad.findFirst({
      where: { barberId, dayOfWeek, active: true },
    });

    if (!workingHour) {
      throw new Error("O barbeiro não atende neste dia da semana.");
    }

    const workStartMinutes = timeToMinutes(workingHour.startTime);
    const workEndMinutes = timeToMinutes(workingHour.endTime);
    const breakStartMinutes = workingHour.breakStart ? timeToMinutes(workingHour.breakStart) : null;
    const breakEndMinutes = workingHour.breakEnd ? timeToMinutes(workingHour.breakEnd) : null;

    // Valida se o agendamento está totalmente contido no horário de expediente
    if (appStartMinutes < workStartMinutes || appEndMinutes > workEndMinutes) {
      throw new Error("O tempo total do serviço ultrapassa o horário de expediente.");
    }

    // Valida se o agendamento entra em conflito com a pausa/almoço (caso haja pausa cadastrada)
    if (breakStartMinutes !== null && breakEndMinutes !== null) {
      if (appStartMinutes < breakEndMinutes && appEndMinutes > breakStartMinutes) {
        throw new Error("O tempo total do serviço entra em conflito com o intervalo do barbeiro.");
      }
    }

    // Define os limites exatos do dia para busca de agendamentos e bloqueios existentes
    const startOfDay = new Date(year, month, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month, day, 23, 59, 59, 999);

    // Busca agendamentos ativos já existentes para este barbeiro no mesmo dia
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        barberId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: "CANCELED" },
      },
      include: { services: true },
    });

    // Busca bloqueios de agenda (TimeOff) do barbeiro que cobrem este dia
    const scheduleBlocks = await prisma.timeOff.findMany({
      where: {
        barberId,
        startTime: { lte: endOfDay },
        endTime: { gte: startOfDay },
      },
    });

    // Valida colisão entre o novo agendamento e outros agendamentos existentes
    const hasAppointmentConflict = existingAppointments.some((app) => {
      const appDate = new Date(app.date);
      const start = appDate.getHours() * 60 + appDate.getMinutes();
      const existingDuration = app.services.reduce((acc, s) => acc + s.duration, 0);
      const end = start + existingDuration;
      return appStartMinutes < end && appEndMinutes > start;
    });

    if (hasAppointmentConflict) {
      throw new Error("Este horário já foi reservado ou ultrapassa outro agendamento.");
    }

    // Valida colisão com bloqueios manuais de horário (TimeOff) via comparação de timestamps absolutos
    const appStartMs = appointmentDate.getTime();
    const appEndMs = appStartMs + totalDuration * 60 * 1000;

    const hasBlockConflict = scheduleBlocks.some((block) => {
      const blockStartMs = new Date(block.startTime).getTime();
      const blockEndMs = new Date(block.endTime).getTime();
      return appStartMs < blockEndMs && appEndMs > blockStartMs;
    });

    if (hasBlockConflict) {
      throw new Error("Horário indisponível devido a um bloqueio na agenda do barbeiro.");
    }

    // Se todas as regras forem satisfeitas, grava o agendamento no banco
    return await prisma.appointment.create({
      data: {
        clientId,
        barberId,
        serviceIds,
        date: appointmentDate,
        status: "PENDING",
      },
      include: {
        services: true,
        client: { select: { id: true, name: true, email: true, phone: true } },
        barber: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
  }
}