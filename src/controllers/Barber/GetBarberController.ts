import type { FastifyRequest, FastifyReply } from "fastify";
import { GetBarberService } from "../../services/Barber/GetBarberService.js";

export class GetBarberController {
    async handle(request: FastifyRequest, reply: FastifyReply){
        const getBarberService = new GetBarberService();

        try {
            const barbers = await getBarberService.execute();
            return reply.status(200).send(barbers);
        } catch(err){
            return reply
            .status(400)
            .send(err);
        }
    }
}
