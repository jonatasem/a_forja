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
import { ListAppointmentsController } from "../controllers/Appointments/ListAppointmentsController.js";
import { UpdateAppointmentStatusController } from "../controllers/Appointments/UpdateAppointmentStatusController.js";
import { ForgotPasswordController } from "../controllers/PasswordReset/ForgotPasswordController.js";
import { ResetPasswordController } from "../controllers/PasswordReset/ResetePasswordController.js";
import { CreateScheduleBlockController } from "../controllers/ScheduleBlock/CreateScheduleBlockController.js";

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

  // Atualiza o status do agendamento (concluído, cancelado/no-show, confirmado)
  fastify.patch(
    "/appointments/status",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const updateAppointmentStatusController = new UpdateAppointmentStatusController();
      return updateAppointmentStatusController.handle(request, reply);
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

  // Busca os agendamentos
  fastify.get(
    "/appointments",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const listAppointmentsController = new ListAppointmentsController();
      return listAppointmentsController.handle(request, reply);
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

  // Bloqueio de agenda (Folgas / Exceções)
  fastify.post(
    "/schedule-blocks",
    { onRequest: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const createScheduleBlockController = new CreateScheduleBlockController();
      return createScheduleBlockController.handle(request, reply);
    }
  );


}