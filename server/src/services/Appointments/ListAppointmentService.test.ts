import { ListAppointmentService } from "./ListAppointmentService.js";
import { prisma } from "../../prisma/index.js";

describe("ListAppointmentService", () => {
  let listAppointmentService: ListAppointmentService;
  let findManySpy: jest.SpyInstance;

  beforeEach(() => {
    listAppointmentService = new ListAppointmentService();
    
    // Cria o spyOn no método findMany do prisma.appointment
    findManySpy = jest.spyOn(prisma.appointment, "findMany").mockResolvedValue([] as any);
  });

  afterEach(() => {
    // Restaura o estado original do método após cada teste
    jest.restoreAllMocks();
  });

  it("deve listar apenas agendamentos do próprio cliente", async () => {
    await listAppointmentService.execute({
      userId: "client-123",
      userRole: "CLIENT",
    });

    expect(findManySpy).toHaveBeenCalledWith({
      where: { clientId: "client-123" },
      include: expect.any(Object),
      orderBy: { date: "asc" },
    });
  });

  it("deve permitir que barbeiro/admin filtre por um barbeiro específico", async () => {
    await listAppointmentService.execute({
      userId: "barber-123",
      userRole: "BARBER",
      barberId: "barber-123",
    });

    expect(findManySpy).toHaveBeenCalledWith({
      where: { barberId: "barber-123" },
      include: expect.any(Object),
      orderBy: { date: "asc" },
    });
  });

  it("deve aplicar filtro por status e data corretamente", async () => {
    await listAppointmentService.execute({
      userId: "client-123",
      userRole: "CLIENT",
      status: "PENDING",
      date: "2026-10-15",
    });

    const expectedStart = new Date("2026-10-15");
    expectedStart.setUTCHours(0, 0, 0, 0);

    const expectedEnd = new Date("2026-10-15");
    expectedEnd.setUTCHours(23, 59, 59, 999);

    expect(findManySpy).toHaveBeenCalledWith({
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