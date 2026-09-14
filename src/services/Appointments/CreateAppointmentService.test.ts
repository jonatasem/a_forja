import { CreateAppointmentService } from "./CreateAppointmentService.js";
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
      create: jest.fn(),
    },
  },
}));

describe("CreateAppointmentService", () => {
  let createAppointmentService: CreateAppointmentService;

  beforeEach(() => {
    createAppointmentService = new CreateAppointmentService();
    jest.clearAllMocks();
  });

  const futureDate = new Date("2099-12-31T09:00:00.000Z");

  const mockAppointmentData = {
    clientId: "client-123",
    barberId: "barber-123",
    serviceId: "service-123",
    date: futureDate.toISOString(),
  };

  it("deve criar um agendamento com sucesso", async () => {
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: "client-123", role: "client" })
      .mockResolvedValueOnce({ id: "barber-123", role: "barber" });

    (prisma.service.findUnique as jest.Mock).mockResolvedValue({
      id: "service-123",
      duration: 30,
      active: true,
    });

    (prisma.workingHours.findFirst as jest.Mock).mockResolvedValue({
      startTime: "08:00",
      endTime: "18:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      active: true,
    });

    (prisma.appointment.findMany as jest.Mock).mockResolvedValue([]);

    const mockCreatedAppointment = {
      id: "app-123",
      clientId: "client-123",
      barberId: "barber-123",
      serviceId: "service-123",
      date: futureDate,
      status: "PENDING",
    };

    (prisma.appointment.create as jest.Mock).mockResolvedValue(mockCreatedAppointment);

    const result = await createAppointmentService.execute(mockAppointmentData);

    expect(result).toEqual(mockCreatedAppointment);
    expect(prisma.appointment.create).toHaveBeenCalledTimes(1);
  });

  it("deve lançar erro se a data for no passado", async () => {
    const pastDateData = {
      ...mockAppointmentData,
      date: "2020-01-01T09:00:00.000Z",
    };

    await expect(createAppointmentService.execute(pastDateData)).rejects.toThrow(
      "Não é possível criar agendamentos em datas passadas."
    );
  });

  it("deve lançar erro se o cliente não for encontrado", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(createAppointmentService.execute(mockAppointmentData)).rejects.toThrow(
      "Cliente não encontrado."
    );
  });

  it("deve lançar erro se o barbeiro não for encontrado", async () => {
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: "client-123", role: "client" })
      .mockResolvedValueOnce(null);

    await expect(createAppointmentService.execute(mockAppointmentData)).rejects.toThrow(
      "Barbeiro não encontrado."
    );
  });

  it("deve lançar erro se o horário estiver em conflito com outro agendamento", async () => {
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: "client-123", role: "client" })
      .mockResolvedValueOnce({ id: "barber-123", role: "barber" });

    (prisma.service.findUnique as jest.Mock).mockResolvedValue({
      id: "service-123",
      duration: 30,
      active: true,
    });

    (prisma.workingHours.findFirst as jest.Mock).mockResolvedValue({
      startTime: "08:00",
      endTime: "18:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      active: true,
    });

    (prisma.appointment.findMany as jest.Mock).mockResolvedValue([
      {
        date: futureDate,
        service: { duration: 30 },
      },
    ]);

    await expect(createAppointmentService.execute(mockAppointmentData)).rejects.toThrow(
      "Este horário já foi reservado."
    );
  });
});