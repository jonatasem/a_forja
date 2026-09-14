import { prisma } from "../../prisma/index.js";

export interface CreateScheduleBlockDTO {
  barberId: string;
  startTime: string | Date;
  endTime: string | Date;
  reason?: string | undefined;
  requestUserId: string;
  requestUserRole?: string | undefined;
}

function parseToUTC(dateInput: string | Date): Date {
  if (dateInput instanceof Date) return dateInput;
  if (
    typeof dateInput === "string" &&
    !dateInput.endsWith("Z") &&
    !dateInput.includes("+") &&
    !dateInput.includes("-", 10)
  ) {
    return new Date(`${dateInput}Z`);
  }
  return new Date(dateInput);
}

export class CreateScheduleBlockService {
  async execute({
    barberId,
    startTime,
    endTime,
    reason,
    requestUserId,
    requestUserRole,
  }: CreateScheduleBlockDTO) {
    if (requestUserRole !== "admin" && requestUserId !== barberId) {
      throw new Error("Você não tem permissão para bloquear a agenda deste barbeiro.");
    }

    const start = parseToUTC(startTime);
    const end = parseToUTC(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Data de início ou término inválida.");
    }

    if (start >= end) {
      throw new Error("O horário final deve ser maior que o horário inicial.");
    }

    const barber = await prisma.user.findUnique({ where: { id: barberId } });
    if (!barber || barber.role !== "barber") {
      throw new Error("Barbeiro não encontrado.");
    }

    // Verifica se já existe um bloqueio idêntico ou sobreposto no mesmo período
    const overlappingBlock = await prisma.scheduleBlock.findFirst({
      where: {
        barberId,
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (overlappingBlock) {
      throw new Error("Já existe um bloqueio de agenda cadastrado para este período.");
    }

    return await prisma.scheduleBlock.create({
      data: {
        barberId,
        startTime: start,
        endTime: end,
        reason: reason ?? null,
      },
    });
  }
}