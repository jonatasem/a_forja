import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { CreateUserService } from "./CreateUserService.js";
import { prisma } from "../../prisma/index.js";
import bcrypt from "bcryptjs";

describe("CreateUserService", () => {
  let createUserService: CreateUserService;

  beforeEach(() => {
    jest.restoreAllMocks();
    createUserService = new CreateUserService();
  });

  const mockUserData = {
    name: "João Silva",
    phone: "11999999999",
    email: "joao@email.com",
    password: "password123",
  };

  it("deve criar um novo usuário com sucesso", async () => {
    // 1. Simula usuário inexistente
    jest.spyOn(prisma.user, "findFirst").mockResolvedValue(null);

    // 2. Simula o hash da senha
    jest.spyOn(bcrypt, "hash").mockResolvedValue("hashed_password" as never);

    // 3. Simula o retorno do usuário cadastrado
    const mockCreatedUser = {
      id: "123",
      name: mockUserData.name,
      phone: mockUserData.phone,
      email: mockUserData.email,
      role: "CLIENT", // Alinhado ao enum em caixa alta
      createdAt: new Date(),
    };
    jest.spyOn(prisma.user, "create").mockResolvedValue(mockCreatedUser as any);

    // Execução
    const result = await createUserService.execute(mockUserData);

    // Asserções
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ phone: mockUserData.phone }, { email: mockUserData.email }],
      },
    });

    expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: mockUserData.name,
        phone: mockUserData.phone,
        email: mockUserData.email,
        password: "hashed_password",
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    expect(result).toEqual(mockCreatedUser);
  });

  it("deve lançar um erro se o e-mail ou telefone já estiver cadastrado", async () => {
    jest.spyOn(prisma.user, "findFirst").mockResolvedValue({
      id: "123",
      phone: mockUserData.phone,
      email: mockUserData.email,
    } as any);

    const spyCreate = jest.spyOn(prisma.user, "create");

    await expect(createUserService.execute(mockUserData)).rejects.toThrow(
      "Já existe um usuário com este e-mail ou telefone."
    );

    expect(spyCreate).not.toHaveBeenCalled();
  });
});