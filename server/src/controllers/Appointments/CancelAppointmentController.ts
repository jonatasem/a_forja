import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { CancelAppointmentService } from "../../services/Appointments/CancelAppointmentService.js";

export const cancelAppointmentSchema = z.object({
  appointmentId: z.string().min(1, { message: "O ID do agendamento é obrigatório." }),
});

export class CancelAppointmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    const userRole = request.user?.role;

    if (!userId) {
      return reply.status(401).send({ error: "Usuário não autenticado." });
    }

    const result = cancelAppointmentSchema.safeParse(request.body);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      return reply.status(400).send({ error: "Dados inválidos.", details: fieldErrors });
    }

    const { appointmentId } = result.data;

    try {
      const cancelAppointmentService = new CancelAppointmentService();
      const appointment = await cancelAppointmentService.execute({
        appointmentId,
        userId,
        userRole,
      });

      return reply.status(200).send(appointment);
    } catch (err) {
      return reply.status(400).send({
        error: err instanceof Error ? err.message : "Erro inesperado ao cancelar agendamento.",
      });
    }
  }
}