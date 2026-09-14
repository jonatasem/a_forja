import { prisma } from "../../prisma/index.js";

export class GetBarberService {
    async execute() {
        const barbers = await prisma.user.findMany({
            where: {
                role: "barber",
                status: {
                    not: "inativo"
                }
            },
            select: {
                id: true,
                role: true,
                status: true,
                name: true,
            }
        });

        return barbers;
    }
}