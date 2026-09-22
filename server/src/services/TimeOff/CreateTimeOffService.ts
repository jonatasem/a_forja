import { prisma } from "../../prisma/index.js";

export interface CreateTimeOffProps {
  barberId: string;
  startTime: string | Date;
  endTime: string | Date;
  userId: string;
  userRole: string;
}

export class CreateTimeOffService {
  async execute({
    barberId,
    startTime,
    endTime,
    userId,
    userRole,
  }: CreateTimeOffProps) {
    // Validação de permissão (apenas ADMIN ou o próprio barbeiro)
    const isAdmin = userRole?.toUpperCase() === "ADMIN";
    if (!isAdmin && userId !== barberId) {
      throw new Error("Você não tem permissão para cadastrar folga para este barbeiro.");
    }

    // Instancia as datas diretamente usando JS nativo
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Valida se as datas passadas são válidas
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Data de início ou término inválida.");
    }

    // Valida se a hora final é posterior à hora inicial
    if (start >= end) {
      throw new Error("O horário final deve ser maior que o horário inicial.");
    }

    // Verifica se o barbeiro existe e possui a role BARBER
    const barber = await prisma.user.findUnique({ where: { id: barberId } });
    if (!barber || barber.role !== "BARBER") {
      throw new Error("Barbeiro não encontrado.");
    }

    // Verifica conflito de horário/sobreposição com outras folgas já cadastradas
    const overlappingTimeOff = await prisma.timeOff.findFirst({
      where: {
        barberId,
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (overlappingTimeOff) {
      throw new Error("Já existe uma folga/bloqueio cadastrado para este período.");
    }

    // Salva a nova folga no banco de dados
    return await prisma.timeOff.create({
      data: {
        barberId,
        startTime: start,
        endTime: end,
      },
    });
  }
}