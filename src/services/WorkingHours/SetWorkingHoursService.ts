import { prisma } from '../../prisma/index.js';

export interface SetWorkingHoursProps {
  barberId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string | undefined;
  breakEnd?: string | undefined;
  active?: boolean | undefined;
}

export class SetWorkingHoursService {
  async execute({
    barberId,
    dayOfWeek,
    startTime,
    endTime,
    breakStart,
    breakEnd,
    active = true,
  }: SetWorkingHoursProps) {
    const barberExists = await prisma.barber.findUnique({
      where: { id: barberId },
    });

    if (!barberExists) {
      throw new Error('Barbeiro não encontrado.');
    }

    const workingHour = await prisma.workingHours.upsert({
      where: {
        barberId_dayOfWeek: {
          barberId,
          dayOfWeek,
        },
      },
      update: {
        startTime,
        endTime,
        breakStart: breakStart ?? null,
        breakEnd: breakEnd ?? null,
        active,
      },
      create: {
        barberId,
        dayOfWeek,
        startTime,
        endTime,
        breakStart: breakStart ?? null,
        breakEnd: breakEnd ?? null,
        active,
      },
    });

    return workingHour;
  }
}