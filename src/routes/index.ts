import type {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";

import { CreateUserController } from "../controllers/User/CreateUserController.js";

export async function routes(
  fastify: FastifyInstance,
) {
  fastify.get(
    "/teste",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return {ok: "ok"};
    },
  );

  fastify.post(
    "/client",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const createUserController = new CreateUserController();
      return createUserController.handle(request, reply);
    },
  );

}