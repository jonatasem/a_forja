import { prisma } from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

interface CreateServiceProps {
  name: string;
  description: string;
  price: number;
  duration: number;
  userRole: string;
}

export class CreateServiceService {
  async execute({ name, description, price, duration, userRole }: CreateServiceProps) {
    if (!isManagement(userRole)) {
      throw new Error("Apenas barbeiros ou gestores têm permissão para criar serviços.");
    }

    // Busca insensível a maiúsculas/minúsculas compatível com MongoDB
    const serviceExists = await prisma.service.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive", // Mantido se o Prisma Client estritamente o aceitar no seu setup
        },
      },
    });

    if (serviceExists) {
      throw new Error("Já existe um serviço cadastrado com este nome.");
    }

    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price,
        duration,
      },
    });

    return service;
  }
}