import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { CreateServiceService } from '../../services/Service/CreateServiceService.js';

// Define o esquema
export const createServiceSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório.' }),
  description: z.string().min(1, { message: 'A descrição é obrigatória.' }),
  price: z.number().positive({ message: 'O preço deve ser um valor positivo.' }),
  duration: z.number().int().positive({ message: 'A duração deve ser um valor positivo em minutos.' }),
});

export type CreateServiceProps = z.infer<typeof createServiceSchema>;
    
export class CreateServiceController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const result = createServiceSchema.safeParse(request.body);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);

      return reply.status(400).send({
        error: 'Dados do serviço inválidos.',
        details: fieldErrors,
      });
    }

    const { name, description, price, duration } = result.data;

    try {
      // Instancia a classe
      const createServiceService = new CreateServiceService();

      const service = await createServiceService.execute({
        name,
        description,
        price,
        duration
      });

      return reply.status(201).send(service);
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message });
      }

      return reply.status(500).send({ error: 'Erro interno no servidor.' });
    }
  }
}