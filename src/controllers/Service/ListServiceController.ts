import type { FastifyRequest, FastifyReply } from "fastify";
import { ListServiceService } from "../../services/Service/ListServiceService.js";

export class ListServiceController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user?.role;

    if (!user) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    try {
      const listService = new ListServiceService();
      const result = await listService.execute();

      return reply.status(200).send(result);
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message });
      }

      return reply.status(500).send({ error: "Erro interno no servidor." });
    }
  }
}