import type {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";

import { CreateUserController } from "../controllers/User/CreateUserController.js";
import { LoginUserController } from "../controllers/Login/LoginUserController.js";
import { authenticate } from "../middlewares/auth.js";
import { CreateServiceController } from "../controllers/Service/CreateServiceController.js";

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
  fastify.post(
    "/services",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const createServiceController = new CreateServiceController();
      return createServiceController.handle(request, reply);
    }
  );
}