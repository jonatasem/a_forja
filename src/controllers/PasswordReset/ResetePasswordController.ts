import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ResetPasswordService } from "../../services/PasswordReset/ResetPasswordService.js";

export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "O token é obrigatório." }),
  newPassword: z.string().min(6, { message: "A nova senha deve ter no mínimo 6 caracteres." }),
});

export class ResetPasswordController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const result = resetPasswordSchema.safeParse(request.body);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      return reply.status(400).send({ error: "Dados inválidos.", details: fieldErrors });
    }

    const { token, newPassword } = result.data;

    try {
      const resetPasswordService = new ResetPasswordService();
      const response = await resetPasswordService.execute({ token, newPassword });

      return reply.status(200).send(response);
    } catch (err) {
      return reply.status(400).send({
        error: err instanceof Error ? err.message : "Erro ao redefinir a senha.",
      });
    }
  }
}