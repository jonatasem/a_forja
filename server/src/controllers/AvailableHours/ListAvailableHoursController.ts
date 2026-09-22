import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ListAvailableHoursService } from "../../services/AvailableHours/ListAvailableHoursService.js";

export const listAvailableHoursQuerySchema = z.object({
  barberId: z.string().min(1, { message: "O ID do barbeiro é obrigatório." }),
  // Aceita uma string única de ID, uma lista tratada como array ou IDs separados por vírgula
  serviceIds: z
    .preprocess((val) => {
      if (typeof val === "string") return val.split(",").map((s) => s.trim());
      return val;
    }, z.array(z.string().min(1)))
    .refine((arr) => arr.length > 0, {
      message: "Selecione pelo menos um serviço.",
    }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "A data deve estar no formato YYYY-MM-DD.",
  }),
});

export class ListAvailableHoursController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const result = listAvailableHoursQuerySchema.safeParse(request.query);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);

      return reply.status(400).send({
        error: "Parâmetros de busca inválidos.",
        details: fieldErrors,
      });
    }

    const { barberId, serviceIds, date } = result.data;

    try {
      const listAvailableHoursService = new ListAvailableHoursService();
      const availableHours = await listAvailableHoursService.execute({
        barberId,
        serviceIds,
        date,
      });

      return reply.status(200).send(availableHours);
    } catch (err) {
      return reply.status(400).send({
        error : "Erro inesperado ao listar horários disponíveis.",
      });
    }
  }
}