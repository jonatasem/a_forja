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
    // Procura o agendamento no banco de dados
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new Error("Agendamento não encontrado.");
    }

    // Garante permissão: apenas o barbeiro designado ou um administrador pode alterar o estado
    if (userRole !== "ADMIN" && appointment.barberId !== userId) {
      throw new Error("Você não tem permissão para alterar o status deste agendamento.");
    }

    // Atualiza e retorna o registo com as relações populadas
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      include: {
        services: true,
        client: { select: { id: true, name: true, email: true, phone: true } },
        barber: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    return updatedAppointment;
  }
}