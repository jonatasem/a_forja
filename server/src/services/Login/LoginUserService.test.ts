import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { LoginUserService } from "./LoginUserService.js";
import { prisma } from "../../prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

describe("LoginUserService", () => {
  let loginUserService: LoginUserService;

  beforeEach(() => {
    // retorna default no fim de cada teste
    jest.restoreAllMocks();
    loginUserService = new LoginUserService();
  });

  it("deve autenticar o usuário e retornar o token JWT", async () => {
    const mockUser = {
      id: "user-id-123",
      name: "João Silva",
      phone: "11999999999",
      email: "joao@email.com",
      password: "hashed_password",
      role: "CLIENT",
    };

    // Simula a busca do usuário retornando os dados fictícios
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser as any);

    // Simula a comparação de senhas do bcryptjs retornando true (senha correta)
    jest.spyOn(bcrypt, "compare").mockImplementation(async () => true);

    // Simula a geração do JWT retornando uma string token fictícia
    jest.spyOn(jwt, "sign").mockReturnValue("mocked_jwt_token" as any);

    // EXECUÇÃO
    const result = await loginUserService.execute({
      phone: "11999999999",
      password: "password123",
    });

    // ASSERÇÕES
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { phone: "11999999999" },
    });

    expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashed_password");

    expect(result).toEqual({
      user: {
        id: mockUser.id,
        name: mockUser.name,
        phone: mockUser.phone,
        email: mockUser.email,
        role: mockUser.role,
      },
      token: "mocked_jwt_token",
    });
  });

  it("deve lançar erro quando o telefone não for encontrado", async () => {
    // Simula a busca retornando null (usuário inexistente)
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null as any);

    await expect(
      loginUserService.execute({
        phone: "11999999999",
        password: "password123",
      })
    ).rejects.toThrow("Telefone não encontrado.");
  });

  it("deve lançar erro quando a senha for incorreta", async () => {
    const mockUser = {
      id: "user-id-123",
      phone: "11999999999",
      password: "hashed_password",
    };

    // Simula que o usuário existe no banco
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser as any);

    // Simula a comparação do bcryptjs retornando false (senha errada)
    jest.spyOn(bcrypt, "compare").mockImplementation(async () => false);

    await expect(
      loginUserService.execute({
        phone: "11999999999",
        password: "wrong_password",
      })
    ).rejects.toThrow("Senha incorreta.");
  });
});