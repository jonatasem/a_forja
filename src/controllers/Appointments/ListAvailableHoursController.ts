import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { ListAvailableHoursService } from '../../services/Appointments/ListAvailableHoursService.js';

export const listAvailableHoursQuerySchema = z.object({
  barberId: z.string().min(1, { message: 'O ID do barbeiro é obrigatório.' }),
  serviceId: z.string().min(1, { message: 'O ID do serviço é obrigatório.' }),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'A data deve estar no formato YYYY-MM-DD.',
    }),
});

export class ListAvailableHoursController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const result = listAvailableHoursQuerySchema.safeParse(request.query);

    if (!result.success) {
      // Uso correto do método .flatten() do próprio objeto de erro do Zod
      const { fieldErrors } = result.error.flatten();

      return reply.status(400).send({
        error: 'Parâmetros de busca inválidos.',
        details: fieldErrors,
      });
    }

    const { barberId, serviceId, date } = result.data;

    try {
      const listAvailableHoursService = new ListAvailableHoursService();
      const availableHours = await listAvailableHoursService.execute({
        barberId,
        serviceId,
        date,
      });

      return reply.status(200).send(availableHours);
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message });
      }

      return reply.status(500).send({ error: 'Erro interno no servidor.' });
    }
  }
}