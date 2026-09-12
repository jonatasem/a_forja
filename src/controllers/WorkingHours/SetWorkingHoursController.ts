import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { SetWorkingHoursService } from '../../services/WorkingHours/SetWorkingHoursService.js';

const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

export const setWorkingHoursSchema = z.object({
  barberId: z.string().min(1, { message: 'O ID do barbeiro é obrigatório.' }),
  dayOfWeek: z
    .number()
    .int()
    .min(0, { message: 'O dia da semana deve ser entre 0 (Domingo) e 6 (Sábado).' })
    .max(6, { message: 'O dia da semana deve ser entre 0 (Domingo) e 6 (Sábado).' }),
  startTime: z.string().regex(timeRegex, { message: 'Horário inicial inválido. Use o formato HH:mm.' }),
  endTime: z.string().regex(timeRegex, { message: 'Horário final inválido. Use o formato HH:mm.' }),
  breakStart: z
    .string()
    .regex(timeRegex, { message: 'Horário de início do intervalo inválido. Use o formato HH:mm.' })
    .optional(),
  breakEnd: z
    .string()
    .regex(timeRegex, { message: 'Horário de fim do intervalo inválido. Use o formato HH:mm.' })
    .optional(),
  active: z.boolean().optional(),
});

export type SetWorkingHoursProps = `z.infer`;

export class SetWorkingHoursController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const userRole = request.user?.role;

    if (!userRole) {
      return reply
        .status(401)
        .send({ error: 'Sessão inválida ou usuário não autenticado.' });
    }

    if (userRole !== 'barber' && userRole !== 'admin') {
      return reply
        .status(403)
        .send({ error: 'Apenas barbeiros ou gestores podem configurar horários.' });
    }

    const result = setWorkingHoursSchema.safeParse(request.body);

    if (!result.success) {
      const { fieldErrors } = result.error.flatten();

      return reply.status(400).send({
        error: 'Dados de horário inválidos.',
        details: fieldErrors,
      });
    }

    const { barberId, dayOfWeek, startTime, endTime, breakStart, breakEnd, active } = result.data;

    try {
      const setWorkingHoursService = new SetWorkingHoursService();

      const workingHour = await setWorkingHoursService.execute({
        barberId,
        dayOfWeek,
        startTime,
        endTime,
        breakStart,
        breakEnd,
        active,
      });

      return reply.status(200).send(workingHour);
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message });
      }

      return reply.status(500).send({ error: 'Erro interno no servidor.' });
    }
  }
}