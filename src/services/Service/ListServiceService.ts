import { prisma } from "../../prisma/index.js";

export class ListServiceService {
  async execute() {
    const result = await prisma.service.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
        active: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return result;
  }
}