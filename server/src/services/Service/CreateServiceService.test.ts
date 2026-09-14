import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { CreateServiceService } from "./CreateServiceService.js";
import { prisma } from "../../prisma/index.js";

describe("CreateServiceService", () => {
  let createServiceService: CreateServiceService;

  beforeEach(() => {
    // Limpa e restaura os mocks antes de cada teste para isolar o estado
    jest.restoreAllMocks();
    createServiceService = new CreateServiceService();
  });

  // Massa de dados reutilizável nos testes
  const mockServiceData = {
    name: "Corte de Cabelo",
    description: "Corte masculino tradicional",
    price: 50.0,
    duration: 30,
    userRole: "BARBER",
  };

  it("deve criar um novo serviço com sucesso", async () => {
    // ARRANGE: Simula que o serviço NÃO existe no banco (retorna null)
    jest.spyOn(prisma.service, "findFirst").mockResolvedValue(null as any);

    const mockCreatedService = {
      id: "service-id-123",
      name: mockServiceData.name,
      description: mockServiceData.description,
      price: mockServiceData.price,
      duration: mockServiceData.duration,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Simula a criação e retorno do registro no Prisma
    jest.spyOn(prisma.service, "create").mockResolvedValue(mockCreatedService as any);

    // ACT: Executa a regra de negócio
    const result = await createServiceService.execute(mockServiceData);

    // ASSERT: Validações
    expect(prisma.service.findFirst).toHaveBeenCalledWith({
      where: {
        name: {
          equals: mockServiceData.name,
          mode: "insensitive",
        },
      },
    });

    expect(prisma.service.create).toHaveBeenCalledWith({
      data: {
        name: mockServiceData.name,
        description: mockServiceData.description,
        price: mockServiceData.price,
        duration: mockServiceData.duration,
      },
    });

    expect(result).toEqual(mockCreatedService);
  });

  it("deve lançar um erro se o usuário não tiver permissão de gerenciamento", async () => {
    // ACT & ASSERT: Tenta criar serviço com uma role sem permissão
    await expect(
      createServiceService.execute({
        ...mockServiceData,
        userRole: "CLIENT",
      })
    ).rejects.toThrow("Apenas barbeiros têm permissão para criar serviços.");
  });

  it("deve lançar um erro se já existir um serviço cadastrado com o mesmo nome", async () => {
    // ARRANGE: Simula que o banco ENCONTROU um serviço com o mesmo nome
    jest.spyOn(prisma.service, "findFirst").mockResolvedValue({
      id: "existing-id",
      name: "Corte de Cabelo",
    } as any);

    const spyCreate = jest.spyOn(prisma.service, "create");

    // ACT & ASSERT: Executa esperando a exceção e garante que a mensagem está correta
    await expect(
      createServiceService.execute(mockServiceData)
    ).rejects.toThrow("Já existe um serviço cadastrado com este nome.");

    // Garante que o banco NÃO tentou criar o registro duplicado
    expect(spyCreate).not.toHaveBeenCalled();
  });
});