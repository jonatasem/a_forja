import { prisma } from "../../prisma/index.js";

// Retorna todos os barbeiros ativos
export class ListBarberService {
    async execute() {
        const barbers = await prisma.user.findMany({
            where: {
                role: "BARBER",
                status: "ACTIVE"
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