import { ListAppointmentsService } from "./ListAppointmentsService.js";
import { prisma } from "../../prisma/index.js";

jest.mock("../../prisma/index.js", () => ({
  prisma: {
    appointment: {
      findMany: jest.fn(),
    },
  },
}));

describe("ListAppointmentsService", () => {
  let listAppointmentsService: ListAppointmentsService;

  beforeEach(() => {
    listAppointmentsService = new ListAppointmentsService();
    jest.clearAllMocks();
  });

  it("deve listar apenas agendamentos do próprio cliente", async () => {
    (prisma.appointment.findMany as jest.Mock).mockResolvedValue([]);

    await listAppointmentsService.execute({
      userId: "client-123",
      userRole: "client",
    });

    expect(prisma.appointment.findMany).toHaveBeenCalledWith({
      where: { clientId: "client-123" },
      include: expect.any(Object),
      orderBy: { date: "asc" },
    });
  });

  it("deve listar apenas agendamentos do barbeiro autenticado", async () => {
    (prisma.appointment.findMany as jest.Mock).mockResolvedValue([]);

    await listAppointmentsService.execute({
      userId: "barber-123",
      userRole: "barber",
    });

    expect(prisma.appointment.findMany).toHaveBeenCalledWith({
      where: { barberId: "barber-123" },
      include: expect.any(Object),
      orderBy: { date: "asc" },
    });
  });

  it("deve aplicar filtro por status e data corretamente", async () => {
    (prisma.appointment.findMany as jest.Mock).mockResolvedValue([]);

    await listAppointmentsService.execute({
      userId: "client-123",
      userRole: "client",
      status: "PENDING",
      date: "2026-10-15",
    });

    const expectedStart = new Date("2026-10-15");
    expectedStart.setUTCHours(0, 0, 0, 0);

    const expectedEnd = new Date("2026-10-15");
    expectedEnd.setUTCHours(23, 59, 59, 999);

    expect(prisma.appointment.findMany).toHaveBeenCalledWith({
      where: {
        clientId: "client-123",
        status: "PENDING",
        date: {
          gte: expectedStart,
          lte: expectedEnd,
        },
      },
      include: expect.any(Object),
      orderBy: { date: "asc" },
    });
  });
});