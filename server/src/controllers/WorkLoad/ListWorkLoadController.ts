import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ListWorkLoadService } from "../../services/WorkLoader/ListWorkLoadService.js";

// Schema de validação dos parâmetros de query (Query Parameters)
export const listWorkLoadSchema = z.object({
  barberId: z.string().min(1, { message: "O ID do barbeiro é obrigatório." }),
  // Preprocessa a entrada: transforma strings separadas por vírgula em array ou mantém array
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

export class ListWorkLoadController {
  /**
   * Controller responsável por receber as buscas por horários disponíveis de um barbeiro em um dia.
   */
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const result = listWorkLoadSchema.safeParse(request.query);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);

      return reply.status(400).send({
        error: "Parâmetros de busca inválidos.",
        details: fieldErrors,
      });
    }

    const { barberId, serviceIds, date } = result.data;

    try {
      const listWorkLoadService = new ListWorkLoadService();
      const availableHours = await listWorkLoadService.execute({
        barberId,
        serviceIds,
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