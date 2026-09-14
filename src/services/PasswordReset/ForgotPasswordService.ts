import crypto from "node:crypto";
import { prisma } from "../../prisma/index.js";

export interface ForgotPasswordDTO {
  email: string;
}

export class ForgotPasswordService {
  async execute({ email }: ForgotPasswordDTO) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Usuário não encontrado com este e-mail.");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // Expira em 1 hora

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // O token é retornado para integração com serviços de envio de e-mail (Nodemailer/Resend)
    return {
      message: "Token de recuperação gerado com sucesso.",
      token,
    };
  }
}