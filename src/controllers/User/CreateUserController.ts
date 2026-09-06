import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateUserService } from "../../services/User/CreateUserService.js";

export interface CreateUserProps {
    name: string;
    phone: string;
    email: string;
    address: string;
    password: string;
}

export class CreateUserController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { name, phone, email, address, password } = request.body as CreateUserProps;

    if(!name || !phone || !email || !address || !password) {
      return reply
      .status(400)
      .send({ error: "Todos os campos são obrigatórios." });
    }

    try {
        const createUserService = new CreateUserService();
        await createUserService.execute({ name, phone, email, address, password });
        return reply
          .status(201)
          .send({ message: "Usuário criado com sucesso." });
    } catch (error) {
    
    if (error instanceof Error) {
      return reply
        .status(400)
        .send({ error: error.message });
    }

    return reply
      .status(500)
      .send({ error: "Erro interno no servidor." });
    }
  } 
}

