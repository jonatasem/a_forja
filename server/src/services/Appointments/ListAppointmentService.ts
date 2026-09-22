import { prisma } from "../../prisma/index.js";

export interface ListAppointmentServiceProps {
  userId: string;
  userRole?: string | undefined;
  status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED" | undefined;
  date?: string | undefined;
  barberId?: string | undefined;
  clientId?: string | undefined;
}

export class ListAppointmentService {
  async execute({
    userId,
    userRole,
    status,
    date,
    barberId,
    clientId,
  }: ListAppointmentServiceProps) {
    const where: any = {};

    // BARBER e ADMIN têm acesso total para filtrar por qualquer barbeiro ou cliente
    if (userRole === "BARBER" || userRole === "ADMIN") {
      if (barberId) where.barberId = barberId;
      if (clientId) where.clientId = clientId;
    } else {
      // Cliente comum enxerga unicamente os seus próprios agendamentos
      where.clientId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Formato de data inválido.");
      }

      const startOfDay = new Date(parsedDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(parsedDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        services: true,
        client: { select: { id: true, name: true, email: true, phone: true } },
        barber: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: {
        date: "asc",
      },
    });

    return appointments;
  }
}