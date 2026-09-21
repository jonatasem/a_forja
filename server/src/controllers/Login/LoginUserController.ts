import { z } from 'zod';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { LoginUserService } from '../../services/Login/LoginUserService.js';

export const loginSchema = z.object({
  phone: z.string().min(1, { message: 'O telefone é obrigatório.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

export type LoginProps = z.infer<typeof loginSchema>;

export class LoginUserController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const result = loginSchema.safeParse(request.body);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      
      return reply.status(400).send({
        error: 'Dados de login inválidos.',
        details: fieldErrors,
      });
    }

    const { phone, password } = result.data;

    try {
      const loginUserService = new LoginUserService();
      const dataLoginUserService = await loginUserService.execute({ phone, password });

      return reply.status(200).send({...dataLoginUserService});
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message });
      }

      return reply.status(500).send({ error: 'Erro interno no servidor.' });
    }
  }
}