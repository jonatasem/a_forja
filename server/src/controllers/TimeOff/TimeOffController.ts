import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { CreateTimeOffService } from "../../services/TimeOff/CreateTimeOffService.js";

export const createTimeOffSchema = z.object({
  barberId: z.string().min(1, { message: "O ID do barbeiro é obrigatório." }),
  startTime: z.string().min(1, { message: "A data/hora inicial é obrigatória." }),
  endTime: z.string().min(1, { message: "A data/hora final é obrigatória." })
});

export class CreateTimeOffController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.sub;
    const userRole = request.user?.role;

    if (!userId) {
      return reply.status(401).send({ error: "Id não autenticado." });
    }

    if(!userRole){
      return reply.status(401).send({ error: "Role não autenticado." });
    }

    const result = createTimeOffSchema.safeParse(request.body);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      return reply.status(400).send({ error: "Dados inválidos.", details: fieldErrors });
    }

    const { barberId, startTime, endTime } = result.data;

    try {
      const createTimeOffService = new CreateTimeOffService();
      const timeOff = await createTimeOffService.execute({
        barberId,
        startTime,
        endTime,
        userId,
        userRole,
      });

      return reply.status(201).send(timeOff);
    } catch (err) {
      return reply.status(400).send({
        error : "Erro ao cadastrar folga/bloqueio.",
      });
    }
  }
}