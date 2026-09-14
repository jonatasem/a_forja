import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ListAvailableHoursService } from "../../services/AvailableHours/ListAvailableHoursService.js";

export const listAvailableHoursQuerySchema = z.object({
  barberId: z.string().min(1, { message: "O ID do barbeiro é obrigatório." }),
  serviceId: z.string().min(1, { message: "O ID do serviço é obrigatório." }),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "A data deve estar no formato YYYY-MM-DD.",
    }),
});

export class ListAvailableHoursController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const result = listAvailableHoursQuerySchema.safeParse(request.query);

    if (!result.success) {
      // Substituído result.error.flatten() por z.flattenError(result.error)
      const { fieldErrors } = z.flattenError(result.error);

      return reply.status(400).send({
        error: "Parâmetros de busca inválidos.",
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
    } catch (err) {
      return reply.status(400).send({
        error: err instanceof Error ? err.message : "Erro inesperado ao listar horários disponíveis.",
      });
    }
  }
}