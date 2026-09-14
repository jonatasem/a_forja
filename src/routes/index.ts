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
import { SetWorkingHoursController } from "../controllers/WorkingHours/SetWorkingHoursController.js";
import { CreateAppointmentController } from "../controllers/Appointments/CreateAppointmentController.js";
import { CancelAppointmentController } from "../controllers/Appointments/CancelAppointmentController.js";
import { ListAvailableHoursController } from "../controllers/AvailableHours/ListAvailableHoursController.js";
import { GetBarberController } from "../controllers/Barber/GetBarberController.js";

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

  //=====================//

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
  );

  fastify.post(
    "/working-hours",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const setWorkingHoursController = new SetWorkingHoursController();
      return setWorkingHoursController.handle(request, reply);
    }
  );

  // AGENDAMENTOS

  // Cria um novo agendamento
  fastify.post(
    "/appointments",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const createAppointmentController = new CreateAppointmentController();
      return createAppointmentController.handle(request, reply);
    }
  );

  // Cancela um agendamento
  fastify.patch(
    "/appointments/cancel",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const cancelAppointmentController = new CancelAppointmentController();
      return cancelAppointmentController.handle(request, reply);
    }
  );

  // Busca os horários disponíveis do barbeiro
  fastify.get(
    "/appointments/available",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const listAvailableHoursController = new ListAvailableHoursController();
      return listAvailableHoursController.handle(request, reply);
    }
  );

  // Busca os Barbeiros Ativos
  fastify.get(
    "/barbers",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const getBarberController = new GetBarberController();
      return getBarberController.handle(request, reply);
    }
  );
}