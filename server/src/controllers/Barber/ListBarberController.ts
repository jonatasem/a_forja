import type { FastifyRequest, FastifyReply } from "fastify";
import { ListBarberService } from "../../services/Barber/ListBarberService.js";

export class ListBarberController {
    async handle(request: FastifyRequest, reply: FastifyReply){
        const listBarberService = new ListBarberService();

        try {
            const barbers = await listBarberService.execute();
            return reply.status(200).send(barbers);
        } catch(err){
            return reply
            .status(400)
            .send({error : "Erro ao listar barbeiros"})
        }
    }
}
