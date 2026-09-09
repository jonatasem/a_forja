import type {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";

import { CreateUserController } from "../controllers/User/CreateUserController.js";
import { LoginUserController } from "../controllers/Login/LoginUserController.js";
import { authenticate } from "../middlewares/auth.js";

export async function routes(fastify: FastifyInstance) {
  // Rota pública para criação de usuário
  fastify.post(
    "/client",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const createUserController = new CreateUserController();
      return createUserController.handle(request, reply);
    }
  );

  // Rota pública para login
  fastify.post(
    "/login",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const loginUserController = new LoginUserController();
      return loginUserController.handle(request, reply);
    }
  );

  // Rota protegida por token JWT
  fastify.get(
    "/me",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.status(200).send({
        message: "Acesso autorizado",
        user: request.user,
      });
    }
  );
}