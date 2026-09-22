import { prisma } from "../../prisma/index.js";

// Interface que define os dados necessários para o cancelamento
export interface CancelAppointmentDTO {
  appointmentId: string;
  userId: string;
  userRole?: string | undefined;
}

export class CancelAppointmentService {
  /**
   * Serviço responsável por processar o cancelamento de um agendamento existente.
   */
  async execute({ appointmentId, userId, userRole }: CancelAppointmentDTO) {
    // 1. Procura o agendamento no banco de dados pelo ID fornecido
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    // Lança erro caso o agendamento não exista
    if (!appointment) {
      throw new Error("Agendamento não encontrado.");
    }

    // 2. Impede o re-cancelamento de agendamentos que já se encontram cancelados
    if (appointment.status === "CANCELED") {
      throw new Error("Este agendamento já está cancelado.");
    }

    // 3. Validação do controlo de acessos (RBAC)
    const isClientOwner = appointment.clientId === userId; // É o cliente que agendou
    const isBarberOwner = appointment.barberId === userId; // É o barbeiro responsável pelo corte
    const isAdmin = userRole === "BARBER"; // Define se a role concede permissões administrativas

    // Apenas o próprio cliente, o barbeiro responsável ou um administrador podem cancelar
    if (!isClientOwner && !isBarberOwner && !isAdmin) {
      throw new Error("Você não tem permissão para cancelar este agendamento.");
    }

    // 4. Impede o cancelamento de agendamentos com datas retroativas
    if (new Date(appointment.date) < new Date()) {
      throw new Error("Não é possível cancelar agendamentos passados.");
    }

    // 5. Atualiza o estado do agendamento para "CANCELED" no banco de dados
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CANCELED",
      },
    });

    return updatedAppointment;
  }
}