import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { CreateScheduleBlockService } from "../../services/ScheduleBlock/CreateScheduleBlockService.js";

export const createScheduleBlockSchema = z.object({
  barberId: z.string().min(1, { message: "O ID do barbeiro é obrigatório." }),
  startTime: z.string().min(1, { message: "A data/hora inicial é obrigatória." }),
  endTime: z.string().min(1, { message: "A data/hora final é obrigatória." }),
  reason: z.string().optional(),
});

export class CreateScheduleBlockController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    const userRole = request.user?.role;

    if (!userId) {
      return reply.status(401).send({ error: "Usuário não autenticado." });
    }

    const result = createScheduleBlockSchema.safeParse(request.body);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      return reply.status(400).send({ error: "Dados inválidos.", details: fieldErrors });
    }

    const { barberId, startTime, endTime, reason } = result.data;

    try {
      const createScheduleBlockService = new CreateScheduleBlockService();
      const block = await createScheduleBlockService.execute({
        barberId,
        startTime,
        endTime,
        reason,
        requestUserId: userId,
        requestUserRole: userRole,
      });

      return reply.status(201).send(block);
    } catch (err) {
      return reply.status(400).send({
        error: err instanceof Error ? err.message : "Erro ao criar bloqueio de agenda.",
      });
    }
  }
}