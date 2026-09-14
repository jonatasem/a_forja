import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { CreateAppointmentService } from "../../services/Appointments/CreateAppointmentService.js";

export const createAppointmentSchema = z.object({
  barberId: z.string().min(1, { message: "O ID do barbeiro é obrigatório." }),
  serviceId: z.string().min(1, { message: "O ID do serviço é obrigatório." }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: "Formato de data inválido.",
}),
});

export class CreateAppointmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const clientId = request.user?.sub;

    if (!clientId) {
      return reply.status(401).send({ error: "Usuário não autenticado." });
    }

    const result = createAppointmentSchema.safeParse(request.body);

    if (!result.success) {
      const { fieldErrors } = result.error.flatten();
      return reply.status(400).send({ error: "Dados inválidos.", details: fieldErrors });
    }

    const { barberId, serviceId, date } = result.data;

    try {
      const service = new CreateAppointmentService();
      const appointment = await service.execute({ clientId, barberId, serviceId, date });
      return reply.status(201).send(appointment);
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message });
      }
      return reply.status(500).send({ error: "Erro interno no servidor." });
    }
  }
}