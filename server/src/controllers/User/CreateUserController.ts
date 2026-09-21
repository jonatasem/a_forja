import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateUserService } from "../../services/User/CreateUserService.js";
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  phone: z.string().min(1, { message: "O telefone é obrigatório" }),
  email: z.email({ message: "Formato de e-mail inválido" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

// Se adicionar um campo novo no schema acima, a tipagem 'CreateUserProps' atualiza sozinha!
export type CreateUserProps = z.infer<typeof createUserSchema>;

export class CreateUserController {
  async handle(request: FastifyRequest, reply: FastifyReply) {

    // Validação silenciosa, retorna true ou false (safeParse)
    const result = createUserSchema.safeParse(request.body);

    // Se for FALSE, significa que o usuário enviou algum dado incorreto ou omitiu campos.
    if (!result.success) {
      
      /*
        Por padrão, o Zod gera um log completo, poluido de informações.
        O (z.flattenError) gera um objeto limpo, exemplo: { email: ["Mensagem de erro"] }.
      */
      const { fieldErrors } = z.flattenError(result.error);

      // Retorna o exatamente quais campos falharam
      return reply.status(400).send({
        error: "Dados de requisição inválidos.",
        details: fieldErrors, 
      });
    }

    // O 'result.data' garante que apenas os campos validados entrem.
    const { name, phone, email, password } = result.data;

    try {
        const createUserService = new CreateUserService();
        await createUserService.execute({ name, phone, email, password });

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