import { ForgotPasswordService } from "./ForgotPasswordService.js";
import { ResetPasswordService } from "./ResetPasswordService.js";
import { prisma } from "../../prisma/index.js";
import bcrypt from "bcrypt";

jest.mock("../../prisma/index.js", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    passwordReset: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
}));

describe("Password Reset Services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("ForgotPasswordService", () => {
    it("deve gerar um token de recuperação de senha", async () => {
      const forgotPasswordService = new ForgotPasswordService();

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "cliente@teste.com",
      });

      (prisma.passwordReset.create as jest.Mock).mockResolvedValue({
        id: "reset-123",
        userId: "user-123",
        token: "random_token",
      });

      const result = await forgotPasswordService.execute({ email: "cliente@teste.com" });

      expect(result).toHaveProperty("token");
      expect(prisma.passwordReset.create).toHaveBeenCalled();
    });

    it("deve lançar erro se o usuário não for encontrado", async () => {
      const forgotPasswordService = new ForgotPasswordService();
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        forgotPasswordService.execute({ email: "inexistente@teste.com" })
      ).rejects.toThrow("Usuário não encontrado com este e-mail.");
    });
  });

  describe("ResetPasswordService", () => {
    it("deve redefinir a senha com sucesso", async () => {
      const resetPasswordService = new ResetPasswordService();

      const futureDate = new Date(Date.now() + 1000 * 60 * 30);
      (prisma.passwordReset.findUnique as jest.Mock).mockResolvedValue({
        id: "reset-123",
        userId: "user-123",
        token: "valid_token",
        expiresAt: futureDate,
      });

      const result = await resetPasswordService.execute({
        token: "valid_token",
        newPassword: "newpassword123",
      });

      expect(result.message).toBe("Senha redefinida com sucesso.");
      expect(bcrypt.hash).toHaveBeenCalledWith("newpassword123", 8);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { password: "hashed_password" },
      });
      expect(prisma.passwordReset.delete).toHaveBeenCalledWith({
        where: { id: "reset-123" },
      });
    });

    it("deve lançar erro se o token tiver expirado", async () => {
      const resetPasswordService = new ResetPasswordService();

      const pastDate = new Date(Date.now() - 1000 * 60 * 30);
      (prisma.passwordReset.findUnique as jest.Mock).mockResolvedValue({
        id: "reset-123",
        userId: "user-123",
        token: "expired_token",
        expiresAt: pastDate,
      });

      await expect(
        resetPasswordService.execute({
          token: "expired_token",
          newPassword: "newpassword123",
        })
      ).rejects.toThrow("Token de recuperação expirado.");
    });
  });
});