import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { CreateUserService } from "./CreateUserService.js";
import { prisma } from "../../prisma/index.js";
import bcrypt from "bcryptjs";

describe("CreateUserService", () => {
  let createUserService: CreateUserService;

  beforeEach(() => {
    // Limpa e restaura o comportamento original de todos os espionadores/spies antes de cada teste.
    // Isso previne vazamento de dados de um teste para o outro e previne erros de tipagem do TypeScript no ESM.
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
    // CENÁRIO 1: O telefone não existe no banco (retorna null)
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null as any);

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
    // Garante que o Prisma buscou o telefone correto
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { phone: mockUserData.phone },
    });

    // Garante que a senha passada foi criptografada com salt custo 10
    expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);

    // Garante que a inserção no banco foi chamada com a senha criptografada
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        role: "client",
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

    // Garante que o retorno do serviço é exatamente o objeto do usuário criado
    expect(result).toEqual(mockCreatedUser);
  });

  it("deve lançar um erro se o telefone já estiver cadastrado", async () => {
    // CENÁRIO: O banco retorna um usuário existente para aquele telefone
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue({
      id: "123",
      phone: mockUserData.phone,
    } as any);

    // Espionamos o método de criação para garantir que ele NUNCA será chamado
    const spyCreate = jest.spyOn(prisma.user, "create");

    // EXECUÇÃO E ASSERÇÃO DE EXCEÇÃO
    await expect(createUserService.execute(mockUserData)).rejects.toThrow(
      "Já existe um usuário com este telefone."
    );

    // Confirma que nenhum registro foi inserido no banco de dados
    expect(spyCreate).not.toHaveBeenCalled();
  });
});