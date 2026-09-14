import { ListAvailableHoursService } from "./ListAvailableHoursService.js";
import { prisma } from "../../prisma/index.js";

jest.mock("../../prisma/index.js", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    service: {
      findUnique: jest.fn(),
    },
    workingHours: {
      findFirst: jest.fn(),
    },
    appointment: {
      findMany: jest.fn(),
    },
  },
}));

describe("ListAvailableHoursService", () => {
  let listAvailableHoursService: ListAvailableHoursService;

  beforeEach(() => {
    listAvailableHoursService = new ListAvailableHoursService();
    jest.clearAllMocks();
  });

  const mockQuery = {
    barberId: "barber-123",
    serviceId: "service-123",
    date: "2099-12-31", // Data futura para evitar conflitos de horário atual
  };

  it("deve retornar os horários disponíveis descontando intervalo e agendamentos existentes", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "barber-123",
      role: "barber",
    });

    (prisma.service.findUnique as jest.Mock).mockResolvedValue({
      id: "service-123",
      duration: 30,
      active: true,
    });

    (prisma.workingHours.findFirst as jest.Mock).mockResolvedValue({
      startTime: "08:00",
      endTime: "12:00",
      breakStart: "10:00",
      breakEnd: "11:00",
      active: true,
    });

    const appointmentDate = new Date(Date.UTC(2099, 11, 31, 8, 30));
    (prisma.appointment.findMany as jest.Mock).mockResolvedValue([
      {
        date: appointmentDate,
        service: { duration: 30 },
      },
    ]);

    const result = await listAvailableHoursService.execute(mockQuery);

    // Horários previstos de 08:00 a 12:00 com slots de 30min:
    // 08:00 (Livre)
    // 08:30 (Ocupado por agendamento)
    // 09:00 (Livre)
    // 09:30 (Livre)
    // 10:00 - 11:00 (Intervalo)
    // 11:00 (Livre)
    // 11:30 (Livre)
    expect(result).toEqual(["08:00", "09:00", "09:30", "11:00", "11:30"]);
  });

  it("deve retornar um array vazio caso o barbeiro não tenha horário cadastrado para o dia", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "barber-123",
      role: "barber",
    });

    (prisma.service.findUnique as jest.Mock).mockResolvedValue({
      id: "service-123",
      active: true,
    });

    (prisma.workingHours.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await listAvailableHoursService.execute(mockQuery);

    expect(result).toEqual([]);
  });

  it("deve lançar um erro caso o barbeiro não seja encontrado", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(listAvailableHoursService.execute(mockQuery)).rejects.toThrow(
      "Barbeiro não encontrado."
    );
  });

  it("deve lançar um erro caso o serviço esteja inativo ou inexistente", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "barber-123",
      role: "barber",
    });

    (prisma.service.findUnique as jest.Mock).mockResolvedValue({
      id: "service-123",
      active: false,
    });

    await expect(listAvailableHoursService.execute(mockQuery)).rejects.toThrow(
      "Serviço inativo ou inexistente."
    );
  });
});