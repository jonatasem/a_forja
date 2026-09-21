import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { ListServiceService } from "./ListServiceService.js";
import { prisma } from "../../prisma/index.js";

describe("ListServiceService", () => {
  let listServiceService: ListServiceService;

  beforeEach(() => {
    // Restaura os spiers antes de cada teste para evitar contaminação de estado
    jest.restoreAllMocks();
    listServiceService = new ListServiceService();
  });

  it("deve retornar a lista de serviços ativos", async () => {
    // Dados fictícios que simulam o retorno do Prisma
    const mockServices = [
      {
        id: "1",
        name: "Barba",
        description: "Modelagem de barba",
        price: 35,
        duration: 30,
        active: true,
        createdAt: new Date(),
      },
      {
        id: "2",
        name: "Corte",
        description: "Corte de cabelo",
        price: 45,
        duration: 30,
        active: true,
        createdAt: new Date(),
      },
    ];

    // Intercepta a chamada ao prisma.service.findMany e define o retorno fictício
    jest.spyOn(prisma.service, "findMany").mockResolvedValue(mockServices as any);

    //Executa o método da classe de serviço
    const result = await listServiceService.execute();

    // Verifica se o Prisma foi chamado com a query correta
    expect(prisma.service.findMany).toHaveBeenCalledWith({
      where: {
        active: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
        active: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Verifica se o resultado do serviço bate com a lista simulada
    expect(result).toEqual(mockServices);
  });
});