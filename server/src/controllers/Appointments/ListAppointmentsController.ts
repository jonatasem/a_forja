import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ListAppointmentsService } from "../../services/Appointments/ListAppointmentsService.js";

export const listAppointmentsQuerySchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"]).optional(),
  date: z.string().optional(),
  barberId: z.string().optional(),
  clientId: z.string().optional(),
});

export class ListAppointmentsController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    const userRole = request.user?.role;

    if (!userId) {
      return reply.status(401).send({ error: "Usuário não autenticado." });
    }

    const result = listAppointmentsQuerySchema.safeParse(request.query);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      return reply.status(400).send({ error: "Parâmetros inválidos.", details: fieldErrors });
    }

    const { status, date, barberId, clientId } = result.data;

    try {
      const listAppointmentsService = new ListAppointmentsService();
      const appointments = await listAppointmentsService.execute({
        userId,
        userRole,
        status,
        date,
        barberId,
        clientId,
      });

      return reply.status(200).send(appointments);
    } catch (err) {
      return reply.status(400).send({
        error : "Erro inesperado ao listar agendamentos.",
      });
    }
  }
}