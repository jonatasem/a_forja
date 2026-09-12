import type { FastifyInstance } from "fastify";
import { authenticate } from "../middlewares/auth.js";

import { CreateUserController } from "../controllers/User/CreateUserController.js";
import { LoginUserController } from "../controllers/Login/LoginUserController.js";
import { CreateServiceController } from "../controllers/Service/CreateServiceController.js";
import { ListServiceController } from "../controllers/Service/ListServiceController.js";
import { SetWorkingHoursController } from "../controllers/WorkingHours/SetWorkingHoursController.js";
import { CreateAppointmentController } from "../controllers/Appointments/CreateAppointmentController.js";
import { ListAvailableHoursController } from "../controllers/Appointments/ListAvailableHoursController.js";

export async function routes(fastify: FastifyInstance) {
  // Instâncias dos controllers
  const createUserController = new CreateUserController();
  const loginUserController = new LoginUserController();
  const createServiceController = new CreateServiceController();
  const listServiceController = new ListServiceController();
  const setWorkingHoursController = new SetWorkingHoursController();
  const createAppointmentController = new CreateAppointmentController();
  const listAvailableHoursController = new ListAvailableHoursController();

  // ROTAS PÚBLICAS
  fastify.post("/client", (req, reply) => createUserController.handle(req, reply));
  fastify.post("/login", (req, reply) => loginUserController.handle(req, reply));

  // ROTAS PROTEGIDAS (JWT)
  fastify.post("/services", { onRequest: [authenticate] }, (req, reply) => createServiceController.handle(req, reply));
  fastify.get("/services", { onRequest: [authenticate] }, (req, reply) => listServiceController.handle(req, reply));
  fastify.post("/working-hours", { onRequest: [authenticate] }, (req, reply) => setWorkingHoursController.handle(req, reply));
  
  // AGENDAMENTOS
  fastify.get("/appointments/available", { onRequest: [authenticate] }, (req, reply) => listAvailableHoursController.handle(req, reply));
  fastify.post("/appointments", { onRequest: [authenticate] }, (req, reply) => createAppointmentController.handle(req, reply));
}