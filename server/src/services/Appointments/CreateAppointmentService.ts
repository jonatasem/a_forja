import { prisma } from "../../prisma/index.js";
import type { Prisma } from "@prisma/client";

export interface CreateAppointmentDTO {
  clientId: string;
  barberId: string;
  serviceId: string;
  date: string | Date;
}

type AppointmentWithService = Prisma.AppointmentGetPayload<{
  include: { service: true };
}>;

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export class CreateAppointmentService {
  async execute({ clientId, barberId, serviceId, date }: CreateAppointmentDTO) {
    const appointmentDate = new Date(date);

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

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.active) throw new Error("Serviço inativo ou inexistente.");

    const dayOfWeek = appointmentDate.getUTCDay();
    const appStartMinutes = appointmentDate.getUTCHours() * 60 + appointmentDate.getUTCMinutes();
    const appEndMinutes = appStartMinutes + service.duration;

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
      throw new Error("Horário fora do expediente de trabalho.");
    }

    if (breakStartMinutes !== null && breakEndMinutes !== null) {
      if (appStartMinutes < breakEndMinutes && appEndMinutes > breakStartMinutes) {
        throw new Error("Horário em conflito com a pausa do barbeiro.");
      }
    }

    const startOfDay = new Date(appointmentDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(appointmentDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        barberId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: "CANCELED" },
      },
      include: { service: true },
    });

    const hasConflict = existingAppointments.some((app: AppointmentWithService) => {
      const appDate = new Date(app.date);
      const start = appDate.getUTCHours() * 60 + appDate.getUTCMinutes();
      const end = start + app.service.duration;
      return appStartMinutes < end && appEndMinutes > start;
    });

    if (hasConflict) {
      throw new Error("Este horário já foi reservado.");
    }

    return await prisma.appointment.create({
      data: {
        clientId,
        barberId,
        serviceId,
        date: appointmentDate,
        status: "PENDING",
      },
      include: {
        service: true,
        client: { select: { id: true, name: true, email: true, phone: true } },
        barber: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
  }
}