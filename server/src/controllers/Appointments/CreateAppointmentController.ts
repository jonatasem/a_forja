import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { CreateAppointmentService } from "../../services/Appointments/CreateAppointmentService.js";

export const createAppointmentSchema = z.object({
  barberId: z.string().min(1, { message: "O ID do barbeiro é obrigatório." }),
  serviceIds: z
    .array(z.string().min(1))
    .min(1, { message: "Selecione pelo menos um serviço." }),
  // Garante que a data enviada pelo frontend é conversível para Date
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
      const { fieldErrors } = z.flattenError(result.error);
      return reply.status(400).send({ 
        error: "Dados inválidos.", 
        details: fieldErrors 
      });
    }

    const { barberId, serviceIds, date } = result.data;

    try {
      const createAppointmentService = new CreateAppointmentService();
      
      // Invoca o serviço responsável pela regra de negócio
      const appointment = await createAppointmentService.execute({
        clientId,
        barberId,
        serviceIds,
        date,
      });

      return reply.status(201).send(appointment);
    } catch (err) {
      // Retorna a mensagem de erro específica lançada pela regra de negócio (ex: "Horário ocupado")
      return reply.status(400).send({
        error: err instanceof Error ? err.message : "Erro inesperado ao criar agendamento.",
      });
    }
  }
}