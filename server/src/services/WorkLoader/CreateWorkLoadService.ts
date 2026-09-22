import { prisma } from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

export interface CreateWorkLoadProps {
  barberId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
  userRole: string;
}

export class CreateWorkLoadService {
  async execute({
    barberId,
    dayOfWeek,
    startTime,
    endTime,
    breakStart,
    breakEnd,
    userRole,
  }: CreateWorkLoadProps) {
    if (!isManagement(userRole)) {
      throw new Error("Apenas administradores ou barbeiros podem cadastrar horários.");
    }

    const barberExists = await prisma.user.findUnique({
      where: { id: barberId },
    });

    if (!barberExists) {
      throw new Error("Barbeiro não encontrado.");
    }

    // Verifica se JÁ EXISTE horário cadastrado para este dia da semana
    const workLoadExists = await prisma.workLoad.findUnique({
      where: {
        barberId_dayOfWeek: {
          barberId,
          dayOfWeek,
        },
      },
    });

    if (workLoadExists) {
      throw new Error("Já existe um horário cadastrado para este dia da semana. Use a opção de atualizar.");
    }

    // Cria o registro de horário convertendo undefined para null
    const workLoadService = await prisma.workLoad.create({
      data: {
        barberId,
        dayOfWeek,
        startTime,
        endTime,
        breakStart: breakStart ?? null,
        breakEnd: breakEnd ?? null,
      },
    });

    return workLoadService;
  }
}