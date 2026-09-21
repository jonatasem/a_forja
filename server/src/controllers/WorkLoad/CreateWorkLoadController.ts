import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { CreateWorkLoadService } from "../../services/WorkLoader/CreateWorkLoadService.js";

// Regex para validar formato de horário 24h (00:00 até 23:59)
const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

// Converte string "HH:mm" em minutos totais para facilitar comparações numéricas
const timeToMinutes = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const createWorkLoadSchema = z
  .object({
    barberId: z.string().min(1, { message: "O ID do barbeiro é obrigatório." }),
    dayOfWeek: z
      .number()
      .int()
      .min(0, { message: "O dia da semana deve ser entre 0 (Domingo) e 6 (Sábado)." })
      .max(6, { message: "O dia da semana deve ser entre 0 (Domingo) e 6 (Sábado)." }),
    startTime: z.string().regex(timeRegex, { message: "Horário inicial inválido. Use o formato HH:mm." }),
    endTime: z.string().regex(timeRegex, { message: "Horário final inválido. Use o formato HH:mm." }),
    breakStart: z.string().regex(timeRegex, { message: "Horário de início do intervalo inválido." }),
    breakEnd: z.string().regex(timeRegex, { message: "Horário de fim do intervalo inválido." }),
  })
  // Valida se o término do expediente ocorre após o início
  .refine(
    (data) => timeToMinutes(data.endTime) > timeToMinutes(data.startTime),
    { message: "O horário de término deve ser maior que o horário de início.", path: ["endTime"] }
  )
  // Valida se o intervalo foi informado por completo (início e fim) ou se ambos ficaram vazios
  .refine(
    (data) => !((data.breakStart && !data.breakEnd) || (!data.breakStart && data.breakEnd)),
    { message: "Informe o início e o fim do intervalo, ou deixe ambos vazios.", path: ["breakStart"] }
  )
  // Valida se o intervalo está contido dentro do horário de expediente
  .refine(
    (data) => {
      if (!data.breakStart || !data.breakEnd) return true;
      const start = timeToMinutes(data.startTime);
      const end = timeToMinutes(data.endTime);
      const bStart = timeToMinutes(data.breakStart);
      const bEnd = timeToMinutes(data.breakEnd);

      return bStart >= start && bEnd <= end && bEnd > bStart;
    },
    { message: "O intervalo de almoço/pausa deve estar dentro do horário de expediente.", path: ["breakStart"] }
  );

export class CreateWorkLoadController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const userRole = request.user?.role;

    if (!userRole) {
      return reply.status(401).send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const result = createWorkLoadSchema.safeParse(request.body);

    // Se houver erro de validação nos campos, retorna HTTP 400 com os detalhes
    if (!result.success) {

      const { fieldErrors } = z.flattenError(result.error);
      
      return reply.status(400).send({
        error: "Dados de horário inválidos.",
        details: fieldErrors,
      });
    }

    try {
      const createWorkLoadService = new CreateWorkLoadService();

      // Executa o serviço repassando todos os dados validados mais o userRole
      const workingHour = await createWorkLoadService.execute({
        ...result.data,
        userRole,
      });

      // Retorna o horário configurado com sucesso (HTTP 200)
      return reply.status(200).send(workingHour);
    } catch (err) {
      // Trata erros de regras de negócio lançados pelo Service (HTTP 400)
      if (err instanceof Error) {
        return reply.status(400).send({ error: err.message });
      }

      // Trata erros não esperados do servidor (HTTP 500)
      return reply.status(500).send({ error: "Erro interno no servidor." });
    }
  }
}