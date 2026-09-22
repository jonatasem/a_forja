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
import { CreateWorkLoadController } from "../controllers/WorkLoad/CreateWorkLoadController.js";
import { CreateAppointmentController } from "../controllers/Appointments/CreateAppointmentController.js";
import { CancelAppointmentController } from "../controllers/Appointments/CancelAppointmentController.js";
import { ListWorkLoadController } from "../controllers/WorkLoad/ListWorkLoadController.js";
import { ListBarberController } from "../controllers/Barber/ListBarberController.js";
import { ListAppointmentController } from "../controllers/Appointments/ListAppointmentController.js";
import { UpdateAppointmentStatusController } from "../controllers/Appointments/UpdateAppointmentStatusController.js";
import { ForgotPasswordController } from "../controllers/PasswordReset/ForgotPasswordController.js";
import { ResetPasswordController } from "../controllers/PasswordReset/ResetPasswordController.js";
import { CreateTimeOffController } from "../controllers/TimeOff/TimeOffController.js";

export async function routes(fastify: FastifyInstance) {

  // ROTAS PÚBLICAS
  
  // Cria um novo cliente
  fastify.post(
    "/user",
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

  // Solicitar recuperação de senha (envia e-mail/gera token)
  fastify.post(
    "/forgot-password",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const forgotPasswordController = new ForgotPasswordController();
      return forgotPasswordController.handle(request, reply);
    }
  );

  // Redefinir senha com token
  fastify.post(
    "/reset-password",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const resetPasswordController = new ResetPasswordController();
      return resetPasswordController.handle(request, reply);
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
    "/work-load",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const createWorkLoadController = new CreateWorkLoadController();
      return createWorkLoadController.handle(request, reply);
    }
  );

  // AGENDAMENTOS

  // Cria um novo agendamento
  fastify.post(
    "/appointment",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const createAppointmentController = new CreateAppointmentController();
      return createAppointmentController.handle(request, reply);
    }
  );

  // Cancela um agendamento
  fastify.patch(
    "/appointment/cancel",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const cancelAppointmentController = new CancelAppointmentController();
      return cancelAppointmentController.handle(request, reply);
    }
  );

  // Atualiza o status do agendamento (concluído, cancelado/no-show, confirmado)
  fastify.patch(
    "/appointment/status",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const updateAppointmentStatusController = new UpdateAppointmentStatusController();
      return updateAppointmentStatusController.handle(request, reply);
    }
  );

  // Busca os horários disponíveis do barbeiro
  fastify.get(
    "/work-load",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const listWorkLoadController = new ListWorkLoadController();
      return listWorkLoadController.handle(request, reply);
    }
  );

  // Busca os agendamentos
  fastify.get(
    "/appointments",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const listAppointmentController = new ListAppointmentController();
      return listAppointmentController.handle(request, reply);
    }
  );

  // Busca os Barbeiros Ativos
  fastify.get(
    "/barbers",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const listBarberController = new ListBarberController();
      return listBarberController.handle(request, reply);
    }
  );

  // Bloqueio de agenda (Folgas / Exceções)
  fastify.post(
    "/time-off",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const createTimeOffController = new CreateTimeOffController();
      return createTimeOffController.handle(request, reply);
    }
  );


}