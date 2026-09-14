import { UpdateAppointmentStatusService } from "./UpdateAppointmentStatusService.js";
import { prisma } from "../../prisma/index.js";

jest.mock("../../prisma/index.js", () => ({
  prisma: {
    appointment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("UpdateAppointmentStatusService", () => {
  let updateAppointmentStatusService: UpdateAppointmentStatusService;

  beforeEach(() => {
    updateAppointmentStatusService = new UpdateAppointmentStatusService();
    jest.clearAllMocks();
  });

  it("deve atualizar o status do agendamento com sucesso", async () => {
    const mockAppointment = {
      id: "app-123",
      barberId: "barber-123",
      status: "PENDING",
    };

    const mockUpdated = {
      ...mockAppointment,
      status: "FINISHED",
    };

    (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(mockAppointment);
    (prisma.appointment.update as jest.Mock).mockResolvedValue(mockUpdated);

    const result = await updateAppointmentStatusService.execute({
      appointmentId: "app-123",
      status: "FINISHED",
      userId: "barber-123",
      userRole: "barber",
    });

    expect(result.status).toBe("FINISHED");
    expect(prisma.appointment.update).toHaveBeenCalledWith({
      where: { id: "app-123" },
      data: { status: "FINISHED" },
      include: expect.any(Object),
    });
  });

  it("deve lançar erro se o agendamento não for encontrado", async () => {
    (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      updateAppointmentStatusService.execute({
        appointmentId: "invalid-id",
        status: "FINISHED",
        userId: "barber-123",
        userRole: "barber",
      })
    ).rejects.toThrow("Agendamento não encontrado.");
  });

  it("deve lançar erro se o usuário não for o barbeiro do agendamento", async () => {
    (prisma.appointment.findUnique as jest.Mock).mockResolvedValue({
      id: "app-123",
      barberId: "other-barber-123",
      status: "pending",
    });

    await expect(
      updateAppointmentStatusService.execute({
        appointmentId: "app-123",
        status: "FINISHED",
        userId: "barber-123",
        userRole: "barber",
      })
    ).rejects.toThrow("Você não tem permissão para alterar o status deste agendamento.");
  });
});