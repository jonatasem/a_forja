import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { UpdateAppointmentStatusService } from "../../services/Appointments/UpdateAppointmentStatusService.js";

export const updateAppointmentStatusSchema = z.object({
  appointmentId: z.string().min(1, { message: "O ID do agendamento é obrigatório." }),
  status: z.enum(["CONFIRMED", "FINISHED", "CANCELED"], {
    message: "Status inválido. Use: CONFIRMED, FINISHED ou CANCELED.",
  }),
});

export class UpdateAppointmentStatusController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    const userRole = request.user?.role;

    if (!userId) {
      return reply.status(401).send({ error: "Usuário não autenticado." });
    }

    const result = updateAppointmentStatusSchema.safeParse(request.body);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      return reply.status(400).send({ error: "Dados inválidos.", details: fieldErrors });
    }

    const { appointmentId, status } = result.data;

    try {
      const updateAppointmentStatusService = new UpdateAppointmentStatusService();
      
      const appointment = await updateAppointmentStatusService.execute({
        appointmentId,
        status,
        userId,
        userRole,
      });

      return reply.status(200).send(appointment);
    } catch (err) {
      return reply.status(400).send({
        error: err instanceof Error ? err.message : "Erro inesperado ao atualizar status do agendamento.",
      });
    }
  }
}