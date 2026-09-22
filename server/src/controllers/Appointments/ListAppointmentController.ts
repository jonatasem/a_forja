import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ListAppointmentService } from "../../services/Appointments/ListAppointmentService.js";

// Esquema de validação dos parâmetros de consulta da URL (Query Parameters)
export const listAppointmentSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"]).optional(),
  date: z.string().optional(),
  barberId: z.string().optional(),
  clientId: z.string().optional(),
});

export class ListAppointmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    const userRole = request.user?.role;

    if (!userId) {
      return reply.status(401).send({ error: "Usuário não autenticado." });
    }

    const result = listAppointmentSchema.safeParse(request.query);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      return reply.status(400).send({
        error: "Parâmetros inválidos.", 
        details: fieldErrors 
      });
    }

    const { status, date, barberId, clientId } = result.data;

    try {
      const listAppointmentsService = new ListAppointmentService();
      
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
        error: err instanceof Error ? err.message : "Erro inesperado ao listar agendamentos.",
      });
    }
  }
}