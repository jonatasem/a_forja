import { prisma } from "../../prisma/index.js";

export interface CancelAppointmentDTO {
  appointmentId: string;
  userId: string;
  userRole?: string | undefined;
}

export class CancelAppointmentService {
  async execute({ appointmentId, userId, userRole }: CancelAppointmentDTO) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new Error("Agendamento não encontrado.");
    }

    if (appointment.status === "CANCELED") {
      throw new Error("Este agendamento já está cancelado.");
    }

    const isClientOwner = appointment.clientId === userId;
    const isBarberOwner = appointment.barberId === userId;
    const isAdmin = userRole === "BARBER";

    if (!isClientOwner && !isBarberOwner && !isAdmin) {
      throw new Error("Você não tem permissão para cancelar este agendamento.");
    }

    if (new Date(appointment.date) < new Date()) {
      throw new Error("Não é possível cancelar agendamentos passados.");
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CANCELED",
      },
    });

    return updatedAppointment;
  }
}