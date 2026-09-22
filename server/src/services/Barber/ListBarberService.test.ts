import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { ListBarberService } from "./ListBarberService.js";
import { prisma } from "../../prisma/index.js";

describe("ListBarberService", () => {
  let service: ListBarberService;

  beforeEach(() => {
    jest.restoreAllMocks();
    service = new ListBarberService();
  });

  it("deve retornar a lista de barbeiros ativos com os campos selecionados", async () => {
    const mockBarbers = [
      {
        id: "barber-1",
        name: "Carlos Barbeiro",
        role: "BARBER",
        status: "ACTIVE",
      },
      {
        id: "barber-2",
        name: "João Navalha",
        role: "BARBER",
        status: "ACTIVE",
      },
    ];

    // Espia e simula o retorno do prisma.user.findMany
    const findManySpy = jest
      .spyOn(prisma.user, "findMany")
      .mockResolvedValue(mockBarbers as any);

    const result = await service.execute();

    expect(result).toEqual(mockBarbers);
    expect(findManySpy).toHaveBeenCalledTimes(1);
    expect(findManySpy).toHaveBeenCalledWith({
      where: {
        role: "BARBER",
        status: "ACTIVE",
      },
      select: {
        id: true,
        role: true,
        status: true,
        name: true,
      },
    });
  });

  it("deve retornar uma lista vazia caso não existam barbeiros ativos", async () => {
    const findManySpy = jest
      .spyOn(prisma.user, "findMany")
      .mockResolvedValue([] as any);

    const result = await service.execute();

    expect(result).toEqual([]);
    expect(findManySpy).toHaveBeenCalledTimes(1);
  });
});