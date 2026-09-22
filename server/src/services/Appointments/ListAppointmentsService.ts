import { prisma } from "../../prisma/index.js";

export interface ListAppointmentsDTO {
  userId: string;
  userRole?: string | undefined;
  status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED" | undefined;
  date?: string | undefined;
  barberId?: string | undefined;
  clientId?: string | undefined;
}

export class ListAppointmentsService {
  async execute({
    userId,
    userRole,
    status,
    date,
    barberId,
    clientId,
  }: ListAppointmentsDTO) {
    const where: any = {};

    if (userRole === "BARBER") {
      where.barberId = userId;
    } else if (userRole === "ADMIN") {
      if (barberId) where.barberId = barberId;
      if (clientId) where.clientId = clientId;
    } else {
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
        service: true,
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