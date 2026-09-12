import type {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";

import { authenticate } from "../middlewares/auth.js";
import { CreateUserController } from "../controllers/User/CreateUserController.js";
import { LoginUserController } from "../controllers/Login/LoginUserController.js";
import { CreateServiceController } from "../controllers/Service/CreateServiceController.js";
import { ListServiceController } from "../controllers/Service/ListServiceController.js";

export async function routes(fastify: FastifyInstance) {

  // ROTAS PÚBLICAS
  
  // Cria um novo cliente
  fastify.post(
    "/client",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const createUserController = new CreateUserController();
      return createUserController.handle(request, reply);
    }
  );

  // Fazer login
  fastify.post(
    "/login",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const loginUserController = new LoginUserController();
      return loginUserController.handle(request, reply);
    }
  );

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // ROTAS PROTEGIDAS POR TOKEN JWT

  // Cadastra um novo serviço
  fastify.post(
    "/services",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const createServiceController = new CreateServiceController();
      return createServiceController.handle(request, reply);
    }
  );

  // Busca os serviços
  fastify.get(
    "/services",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const listServiceController = new ListServiceController();
      return listServiceController.handle(request, reply);
    }
  )
}