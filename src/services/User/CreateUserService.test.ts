import { CreateUserService } from "./CreateUserService.js";
import { prisma } from "../../prisma/index.js";
import bcrypt from "bcrypt";

// 1. Criamos os Mocks do Prisma e do Bcrypt para isolar o teste do banco real
jest.mock("../../prisma/index.js", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

describe("CreateUserService", () => {
  let createUserService: CreateUserService;

  beforeEach(() => {
    createUserService = new CreateUserService();
    jest.clearAllMocks(); // Limpa o histórico de chamadas entre os testes
  });

  // Cenário 1: Tudo certo
  it("deve criar um novo usuário com sucesso", async () => {
    const mockUserData = {
      name: "João Silva",
      phone: "11999999999",
      email: "joao@email.com",
      password: "senhaSegura123",
    };

    // Força o Prisma a dizer que o telefone está livre (retorna null)
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    // Força o bcrypt a retornar uma senha criptografada mockada
    (bcrypt.hash as jest.Mock).mockResolvedValue("senha_criptografada");

    // Mock do retorno do banco ao salvar
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: "user-uuid-123",
      name: mockUserData.name,
      phone: mockUserData.phone,
      email: mockUserData.email,
      role: "client",
      createdAt: new Date(),
    });

    const result = await createUserService.execute(mockUserData);

    // Validações
    expect(result).toHaveProperty("id");
    expect(result.name).toBe(mockUserData.name);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { phone: mockUserData.phone },
    });
    expect(prisma.user.create).toHaveBeenCalled();
  });

  // Cenário 2: Erro de telefone duplicado
  it("não deve criar um usuário se o telefone já estiver cadastrado", async () => {
    const mockUserData = {
      name: "Maria Silva",
      phone: "11888888888",
      email: "maria@email.com",
      password: "senhaSegura123",
    };

    // Força o Prisma a simular que o telefone já existe no banco
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "usuario-ja-existente",
      phone: mockUserData.phone,
    });

    // Valida que a função vai estourar o erro esperado
    await expect(
      createUserService.execute(mockUserData)
    ).rejects.toThrow("Já existe um usuário com este telefone.");

    // Garante que o Prisma SEQUER tentou salvar o usuário no banco
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
