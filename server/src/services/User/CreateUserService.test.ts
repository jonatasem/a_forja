import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { CreateUserService } from "./CreateUserService.js";
import { prisma } from "../../prisma/index.js";
import bcrypt from "bcryptjs";

describe("CreateUserService", () => {
  let createUserService: CreateUserService;

  beforeEach(() => {
    // Limpa e restaura o comportamento original de todos os espionadores/spies antes de cada teste
    jest.restoreAllMocks();
    createUserService = new CreateUserService();
  });

  // MASSA DE DADOS REUTILIZÁVEL
  const mockUserData = {
    name: "João Silva",
    phone: "11999999999",
    email: "joao@email.com",
    password: "password123",
  };

  it("deve criar um novo usuário com sucesso", async () => {
    // CENÁRIO 1: O usuário não existe no banco (findFirst retorna null)
    jest.spyOn(prisma.user, "findFirst").mockResolvedValue(null as any);

    // CENÁRIO 2: Simula o método de hash do bcryptjs retornando a senha criptografada
    jest.spyOn(bcrypt, "hash").mockImplementation(async () => "hashed_password");

    // CENÁRIO 3: Simula o retorno do usuário cadastrado pelo Prisma
    const mockCreatedUser = {
      id: "123",
      name: mockUserData.name,
      phone: mockUserData.phone,
      email: mockUserData.email,
      role: "client",
      createdAt: new Date(),
    };
    jest.spyOn(prisma.user, "create").mockResolvedValue(mockCreatedUser as any);

    // EXECUÇÃO
    const result = await createUserService.execute(mockUserData);

    // ASSERÇÕES
    // Garante que a busca verificou telefone OU e-mail
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { phone: mockUserData.phone },
          { email: mockUserData.email },
        ],
      },
    });

    // Garante que a senha foi criptografada
    expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);

    // Garante que a criação não envia role explicitamente (deixa o padrão @default(client))
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

    // Garante que o retorno do serviço é o objeto do usuário
    expect(result).toEqual(mockCreatedUser);
  });

  it("deve lançar um erro se o e-mail ou telefone já estiver cadastrado", async () => {
    // CENÁRIO: O banco retorna um usuário existente para o e-mail ou telefone
    jest.spyOn(prisma.user, "findFirst").mockResolvedValue({
      id: "123",
      phone: mockUserData.phone,
      email: mockUserData.email,
    } as any);

    const spyCreate = jest.spyOn(prisma.user, "create");

    // EXECUÇÃO E ASSERÇÃO DE EXCEÇÃO
    await expect(createUserService.execute(mockUserData)).rejects.toThrow(
      "Já existe um usuário com este e-mail ou telefone."
    );

    // Confirma que nenhum registro foi inserido no banco de dados
    expect(spyCreate).not.toHaveBeenCalled();
  });
});