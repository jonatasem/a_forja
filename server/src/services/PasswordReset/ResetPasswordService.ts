import bcrypt from "bcryptjs";
import { prisma } from "../../prisma/index.js";

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}

export class ResetPasswordService {
  async execute({ token, newPassword }: ResetPasswordDTO) {
    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!passwordReset) {
      throw new Error("Token de recuperação inválido ou inexistente.");
    }

    if (new Date() > passwordReset.expiresAt) {
      await prisma.passwordReset.delete({ where: { id: passwordReset.id } });
      throw new Error("Token de recuperação expirado.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 8);

    await prisma.user.update({
      where: { id: passwordReset.userId },
      data: { password: passwordHash },
    });

    await prisma.passwordReset.delete({
      where: { id: passwordReset.id },
    });

    return { message: "Senha redefinida com sucesso." };
  }
}