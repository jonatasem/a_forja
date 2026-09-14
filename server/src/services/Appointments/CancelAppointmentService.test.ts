import { CancelAppointmentService } from "./CancelAppointmentService.js";
import { prisma } from "../../prisma/index.js";

jest.mock("../../prisma/index.js", () => ({
  prisma: {
    appointment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("CancelAppointmentService", () => {
  let cancelAppointmentService: CancelAppointmentService;

  beforeEach(() => {
    cancelAppointmentService = new CancelAppointmentService();
    jest.clearAllMocks();
  });

  const futureDate = new Date("2099-12-31T10:00:00.000Z");

  const mockAppointment = {
    id: "app-123",
    clientId: "client-123",
    barberId: "barber-123",
    serviceId: "service-123",
    date: futureDate,
    status: "PENDING",
  };

  it("deve cancelar um agendamento com sucesso pelo cliente", async () => {
    (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(mockAppointment);
    (prisma.appointment.update as jest.Mock).mockResolvedValue({
      ...mockAppointment,
      status: "CANCELED",
    });

    const result = await cancelAppointmentService.execute({
      appointmentId: "app-123",
      userId: "client-123",
    });

    expect(prisma.appointment.update).toHaveBeenCalledWith({
      where: { id: "app-123" },
      data: { status: "CANCELED" },
    });
    expect(result.status).toBe("CANCELED");
  });

  it("deve lançar erro se o agendamento não existir", async () => {
    (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      cancelAppointmentService.execute({
        appointmentId: "app-invalid",
        userId: "client-123",
      })
    ).rejects.toThrow("Agendamento não encontrado.");
  });

  it("deve lançar erro se o agendamento já estiver cancelado", async () => {
    (prisma.appointment.findUnique as jest.Mock).mockResolvedValue({
      ...mockAppointment,
      status: "CANCELED",
    });

    await expect(
      cancelAppointmentService.execute({
        appointmentId: "app-123",
        userId: "client-123",
      })
    ).rejects.toThrow("Este agendamento já está cancelado.");
  });

  it("deve lançar erro se o usuário não tiver permissão para cancelar", async () => {
    (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(mockAppointment);

    await expect(
      cancelAppointmentService.execute({
        appointmentId: "app-123",
        userId: "other-user-999",
        userRole: "client",
      })
    ).rejects.toThrow("Você não tem permissão para cancelar este agendamento.");
  });

  it("deve lançar erro ao tentar cancelar agendamentos em datas passadas", async () => {
    (prisma.appointment.findUnique as jest.Mock).mockResolvedValue({
      ...mockAppointment,
      date: new Date("2020-01-01T10:00:00.000Z"),
    });

    await expect(
      cancelAppointmentService.execute({
        appointmentId: "app-123",
        userId: "client-123",
      })
    ).rejects.toThrow("Não é possível cancelar agendamentos passados.");
  });
});