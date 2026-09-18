import { prisma } from "../../prisma/index.js";

export interface CreateAppointmentDTO {
  clientId: string;
  barberId: string;
  serviceIds: string[];
  date: string | Date;
}

function timeToMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export class CreateAppointmentService {
  async execute({ clientId, barberId, serviceIds, date }: CreateAppointmentDTO) {
    let year: number, month: number, day: number, hours: number, minutes: number;

    if (typeof date === "string") {
      const [datePart, timePart = "00:00"] = date.split(/[T ]/);
      const [y, m, d] = (datePart ?? "").split("-").map(Number);
      const [h, min] = (timePart ?? "").split(":").map(Number);

      year = y ?? 0;
      month = (m ?? 1) - 1;
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

    if (isNaN(appointmentDate.getTime())) {
      throw new Error("Data ou horário fornecido é inválido.");
    }

    if (appointmentDate < new Date()) {
      throw new Error("Não é possível criar agendamentos em datas passadas.");
    }

    const client = await prisma.user.findUnique({ where: { id: clientId } });
    if (!client) throw new Error("Cliente não encontrado.");

    const barber = await prisma.user.findUnique({ where: { id: barberId } });
    if (!barber || barber.role !== "barber") throw new Error("Barbeiro não encontrado.");

    // BUSCA TODOS OS SERVIÇOS SELECIONADOS
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        active: true,
      },
    });

    if (services.length !== serviceIds.length) {
      throw new Error("Um ou mais serviços selecionados estão inativos ou não existem.");
    }

    // SOMA A DURAÇÃO TOTAL DE TODOS OS SERVIÇOS SELECIONADOS
    const totalDuration = services.reduce((acc, s) => acc + s.duration, 0);

    const dayOfWeek = appointmentDate.getDay();
    const appStartMinutes = hours * 60 + minutes;
    const appEndMinutes = appStartMinutes + totalDuration;

    const workingHour = await prisma.workingHours.findFirst({
      where: { barberId, dayOfWeek, active: true },
    });

    if (!workingHour) {
      throw new Error("O barbeiro não atende neste dia da semana.");
    }

    const workStartMinutes = timeToMinutes(workingHour.startTime);
    const workEndMinutes = timeToMinutes(workingHour.endTime);
    const breakStartMinutes = workingHour.breakStart ? timeToMinutes(workingHour.breakStart) : null;
    const breakEndMinutes = workingHour.breakEnd ? timeToMinutes(workingHour.breakEnd) : null;

    if (appStartMinutes < workStartMinutes || appEndMinutes > workEndMinutes) {
      throw new Error("O tempo total do serviço ultrapassa o horário de expediente.");
    }

    if (breakStartMinutes !== null && breakEndMinutes !== null) {
      if (appStartMinutes < breakEndMinutes && appEndMinutes > breakStartMinutes) {
        throw new Error("O tempo total do serviço entra em conflito com o intervalo do barbeiro.");
      }
    }

    const startOfDay = new Date(year, month, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month, day, 23, 59, 59, 999);

    // BUSCA AGENDAMENTOS EXISTENTES (USA 'services' NO PLURAL)
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        barberId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: "CANCELED" },
      },
      include: { services: true },
    });

    // BUSCA BLOQUEIOS DE AGENDA
    const scheduleBlocks = await prisma.scheduleBlock.findMany({
      where: {
        barberId,
        startTime: { lte: endOfDay },
        endTime: { gte: startOfDay },
      },
    });

    // VALIDA CONFLITO COM OUTROS AGENDAMENTOS
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

    // VALIDA CONFLITO COM BLOQUEIOS MANUAIS
    const hasBlockConflict = scheduleBlocks.some((block) => {
      const blockStart = new Date(block.startTime);
      const blockEnd = new Date(block.endTime);
      const start = blockStart.getHours() * 60 + blockStart.getMinutes();
      const end = blockEnd.getHours() * 60 + blockEnd.getMinutes();
      return appStartMinutes < end && appEndMinutes > start;
    });

    if (hasBlockConflict) {
      throw new Error("Horário indisponível devido a um bloqueio na agenda do barbeiro.");
    }

    // CRIA O AGENDAMENTO COM A LISTA DE SERVIÇOS
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