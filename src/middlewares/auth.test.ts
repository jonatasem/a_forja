import { authenticate } from "./auth.js";
import type { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

describe("Middleware: authenticate", () => {
  // Tipamos os mocks com 'any' ou a estrutura mínima para evitar atritos com 'exactOptionalPropertyTypes'
  let mockRequest: any;
  let mockReply: any;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, JWT_SECRET: "sua_chave_secreta" };

    // Inicializamos como objeto simples sem atribuir 'user: undefined'
    mockRequest = {
      headers: {},
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("deve autenticar com sucesso e anexa os dados do usuário na requisição", async () => {
    const mockPayload = {
      sub: "user-id-123",
      name: "João Silva",
      email: "joao@email.com",
      phone: "11999999999",
      role: "client",
      iat: 123456,
      exp: 654321,
    };

    mockRequest.headers = {
      authorization: "Bearer token_valido_123",
    };

    (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

    // Fazemos o cast 'as unknown as FastifyRequest' no envio da função
    await authenticate(mockRequest as unknown as FastifyRequest, mockReply as unknown as FastifyReply);

    expect(jwt.verify).toHaveBeenCalledWith("token_valido_123", "sua_chave_secreta");
    expect(mockRequest.user).toEqual({
      sub: mockPayload.sub,
      name: mockPayload.name,
      email: mockPayload.email,
      phone: mockPayload.phone,
      role: mockPayload.role,
    });
    expect(mockReply.status).not.toHaveBeenCalled();
  });

  it("deve retornar status 401 se o header authorization estiver ausente", async () => {
    mockRequest.headers = {};

    await authenticate(mockRequest as unknown as FastifyRequest, mockReply as unknown as FastifyReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: "Não autorizado.",
      message: "Token de acesso não fornecido.",
    });
  });

  it("deve retornar status 401 se o token estiver ausente no header", async () => {
    mockRequest.headers = {
      authorization: "Bearer ",
    };

    await authenticate(mockRequest as unknown as FastifyRequest, mockReply as unknown as FastifyReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: "Não autorizado.",
      message: "Token malformado ou ausente.",
    });
  });

  it("deve retornar status 500 se JWT_SECRET não estiver configurada no .env", async () => {
    delete process.env.JWT_SECRET;

    mockRequest.headers = {
      authorization: "Bearer token_qualquer",
    };

    await authenticate(mockRequest as unknown as FastifyRequest, mockReply as unknown as FastifyReply);

    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: "Erro interno no servidor.",
      message: "A variável de ambiente JWT_SECRET não está definida.",
    });
  });

  it("deve retornar status 401 se o token for inválido ou expirado", async () => {
    mockRequest.headers = {
      authorization: "Bearer token_invalido",
    };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("jwt expired");
    });

    await authenticate(mockRequest as unknown as FastifyRequest, mockReply as unknown as FastifyReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: "Não autorizado.",
      message: "Token inválido ou expirado.",
    });
  });
});