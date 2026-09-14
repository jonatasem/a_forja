import { ListServiceService } from "./ListServiceService.js";
import { prisma } from "../../prisma/index.js";

jest.mock("../../prisma/index.js", () => ({
  prisma: {
    service: {
      findMany: jest.fn(),
    },
  },
}));

describe("Service: ListServiceService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar a lista de serviços ativos", async () => {
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

    (prisma.service.findMany as jest.Mock).mockResolvedValue(mockServices);

    const service = new ListServiceService();
    const result = await service.execute();

    expect(prisma.service.findMany).toHaveBeenCalledWith({
      where: { active: true },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
        active: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });
    expect(result).toEqual(mockServices);
  });
});