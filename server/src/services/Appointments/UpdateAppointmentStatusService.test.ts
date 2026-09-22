import { UpdateAppointmentStatusService } from "./UpdateAppointmentStatusService.js";
import { prisma } from "../../prisma/index.js";

describe("UpdateAppointmentStatusService", () => {
  let updateAppointmentStatusService: UpdateAppointmentStatusService;
  let findUniqueSpy: jest.SpyInstance;
  let updateSpy: jest.SpyInstance;

  beforeEach(() => {
    updateAppointmentStatusService = new UpdateAppointmentStatusService();

    // Cria os espiões nos métodos do Prisma
    findUniqueSpy = jest.spyOn(prisma.appointment, "findUnique");
    updateSpy = jest.spyOn(prisma.appointment, "update");
  });

  afterEach(() => {
    // Restaura o comportamento original após cada teste
    jest.restoreAllMocks();
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

    findUniqueSpy.mockResolvedValue(mockAppointment as any);
    updateSpy.mockResolvedValue(mockUpdated as any);

    const result = await updateAppointmentStatusService.execute({
      appointmentId: "app-123",
      status: "FINISHED",
      userId: "barber-123",
      userRole: "BARBER",
    });

    expect(result.status).toBe("FINISHED");
    expect(updateSpy).toHaveBeenCalledWith({
      where: { id: "app-123" },
      data: { status: "FINISHED" },
      include: expect.any(Object),
    });
  });

  it("deve lançar erro se o agendamento não for encontrado", async () => {
    findUniqueSpy.mockResolvedValue(null);

    await expect(
      updateAppointmentStatusService.execute({
        appointmentId: "invalid-id",
        status: "FINISHED",
        userId: "barber-123",
        userRole: "BARBER",
      })
    ).rejects.toThrow("Agendamento não encontrado.");
  });

  it("deve lançar erro se o usuário não for o barbeiro do agendamento", async () => {
    findUniqueSpy.mockResolvedValue({
      id: "app-123",
      barberId: "other-barber-123",
      status: "PENDING",
    } as any);

    await expect(
      updateAppointmentStatusService.execute({
        appointmentId: "app-123",
        status: "FINISHED",
        userId: "barber-123",
        userRole: "BARBER",
      })
    ).rejects.toThrow("Você não tem permissão para alterar o status deste agendamento.");
  });
});