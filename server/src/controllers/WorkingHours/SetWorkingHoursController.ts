import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { SetWorkingHoursService } from "../../services/WorkingHours/SetWorkingHoursService.js";

const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

// Função utilitária com fallback para garantir valores numéricos válidos
const timeToMinutes = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const setWorkingHoursSchema = z
  .object({
    barberId: z.string().min(1, { message: "O ID do barbeiro é obrigatório." }),
    dayOfWeek: z
      .number()
      .int()
      .min(0, { message: "O dia da semana deve ser entre 0 (Domingo) e 6 (Sábado)." })
      .max(6, { message: "O dia da semana deve ser entre 0 (Domingo) e 6 (Sábado)." }),
    startTime: z.string().regex(timeRegex, { message: "Horário inicial inválido. Use o formato HH:mm." }),
    endTime: z.string().regex(timeRegex, { message: "Horário final inválido. Use o formato HH:mm." }),
    breakStart: z.string().regex(timeRegex, { message: "Horário de início do intervalo inválido." }).optional(),
    breakEnd: z.string().regex(timeRegex, { message: "Horário de fim do intervalo inválido." }).optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (data) => timeToMinutes(data.endTime) > timeToMinutes(data.startTime),
    {
      message: "O horário de término deve ser maior que o horário de início.",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => {
      // Exige que ambos existam ou nenhum exista
      if ((data.breakStart && !data.breakEnd) || (!data.breakStart && data.breakEnd)) {
        return false;
      }
      return true;
    },
    {
      message: "Você deve informar o início e o fim do intervalo, ou deixar ambos vazios.",
      path: ["breakStart"],
    }
  )
  .refine(
    (data) => {
      if (!data.breakStart || !data.breakEnd) return true;
      const start = timeToMinutes(data.startTime);
      const end = timeToMinutes(data.endTime);
      const bStart = timeToMinutes(data.breakStart);
      const bEnd = timeToMinutes(data.breakEnd);

      // O intervalo precisa estar contido no horário de expediente
      return bStart > start && bEnd < end && bEnd > bStart;
    },
    {
      message: "O intervalo de almoço/pausa deve estar dentro do horário de expediente.",
      path: ["breakStart"],
    }
  );

export class SetWorkingHoursController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const userRole = request.user?.role;

    if (!userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    if (userRole !== "barber" && userRole !== "admin") {
      return reply
        .status(403)
        .send({ error: "Apenas barbeiros ou gestores podem configurar horários." });
    }

    const result = setWorkingHoursSchema.safeParse(request.body);

    if (!result.success) {
      const { fieldErrors } = result.error.flatten();

      return reply.status(400).send({
        error: "Dados de horário inválidos.",
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
    } catch (err) {
      return reply.status(400).send({
        error: err instanceof Error ? err.message : "Erro inesperado ao configurar horários.",
      });
    }
  }
}
