import { prisma } from "../../prisma/index.js";

export interface UpdateAppointmentStatusDTO {
  appointmentId: string;
  status: "CONFIRMED" | "FINISHED" | "CANCELED";
  userId: string;
  userRole?: string | undefined;
}

export class UpdateAppointmentStatusService {
  async execute({
    appointmentId,
    status,
    userId,
    userRole,
  }: UpdateAppointmentStatusDTO) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new Error("Agendamento não encontrado.");
    }

    // Permite alteração apenas se o usuário for o barbeiro do agendamento ou um administrador
    if (userRole !== "admin" && appointment.barberId !== userId) {
      throw new Error("Você não tem permissão para alterar o status deste agendamento.");
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      include: {
        service: true,
        client: { select: { id: true, name: true, email: true, phone: true } },
        barber: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    return updatedAppointment;
  }
}