import { SetWorkingHoursService } from "./SetWorkingHoursService.js";
import { prisma } from "../../prisma/index.js";

jest.mock("../../prisma/index.js", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    workingHours: {
      upsert: jest.fn(),
    },
  },
}));

describe("SetWorkingHoursService", () => {
  let setWorkingHoursService: SetWorkingHoursService;

  beforeEach(() => {
    setWorkingHoursService = new SetWorkingHoursService();
    jest.clearAllMocks();
  });

  const mockWorkingHoursData = {
    barberId: "barber-123",
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "18:00",
    breakStart: "12:00",
    breakEnd: "13:00",
    active: true,
  };

  it("deve definir ou atualizar o horário de trabalho com sucesso", async () => {
    const mockBarber = {
      id: "barber-123",
      name: "Barbeiro Teste",
      role: "barber",
    };

    const mockWorkingHoursResult = {
      id: "wh-123",
      ...mockWorkingHoursData,
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockBarber);
    (prisma.workingHours.upsert as jest.Mock).mockResolvedValue(mockWorkingHoursResult);

    const result = await setWorkingHoursService.execute(mockWorkingHoursData);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockWorkingHoursData.barberId },
    });

    expect(prisma.workingHours.upsert).toHaveBeenCalledWith({
      where: {
        barberId_dayOfWeek: {
          barberId: mockWorkingHoursData.barberId,
          dayOfWeek: mockWorkingHoursData.dayOfWeek,
        },
      },
      update: {
        startTime: mockWorkingHoursData.startTime,
        endTime: mockWorkingHoursData.endTime,
        breakStart: mockWorkingHoursData.breakStart,
        breakEnd: mockWorkingHoursData.breakEnd,
        active: mockWorkingHoursData.active,
      },
      create: {
        barberId: mockWorkingHoursData.barberId,
        dayOfWeek: mockWorkingHoursData.dayOfWeek,
        startTime: mockWorkingHoursData.startTime,
        endTime: mockWorkingHoursData.endTime,
        breakStart: mockWorkingHoursData.breakStart,
        breakEnd: mockWorkingHoursData.breakEnd,
        active: mockWorkingHoursData.active,
      },
    });

    expect(result).toEqual(mockWorkingHoursResult);
  });

  it("deve lançar um erro se o barbeiro não for encontrado", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(setWorkingHoursService.execute(mockWorkingHoursData)).rejects.toThrow(
      "Barbeiro não encontrado."
    );

    expect(prisma.workingHours.upsert).not.toHaveBeenCalled();
  });

  it("deve lançar um erro se o usuário encontrado não tiver a role 'barber'", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "barber-123",
      role: "client",
    });

    await expect(setWorkingHoursService.execute(mockWorkingHoursData)).rejects.toThrow(
      "Barbeiro não encontrado."
    );

    expect(prisma.workingHours.upsert).not.toHaveBeenCalled();
  });
});