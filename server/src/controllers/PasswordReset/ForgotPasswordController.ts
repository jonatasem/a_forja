import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ForgotPasswordService } from "../../services/PasswordReset/ForgotPasswordService.js";

export const forgotPasswordSchema = z.object({
  email: z.email({ message: "E-mail inválido." }),
});

export class ForgotPasswordController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const result = forgotPasswordSchema.safeParse(request.body);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      return reply.status(400).send({ error: "Dados inválidos.", details: fieldErrors });
    }

    const { email } = result.data;

    try {
      const forgotPasswordService = new ForgotPasswordService();
      const response = await forgotPasswordService.execute({ email });

      return reply.status(200).send(response);
    } catch (err) {
      return reply.status(400).send({
        error: err instanceof Error ? err.message : "Erro ao solicitar recuperação de senha.",
      });
    }
  }
}