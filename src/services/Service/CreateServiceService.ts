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
      throw new Error("Apenas barbeiros têm permissão para criar serviços.");
    }

    const serviceExists = await prisma.service.findFirst({
      where: {
        name: {
          //deve ser exatamente igual à variável name
          equals: name,
          // ignora a diferença entre maiúsculas e minúsculas ao comparar a string.
          mode: "insensitive",
        },
      },
    });

    if (serviceExists) {
      throw new Error("Já existe um serviço cadastrado com este nome.");
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price,
        duration,
      },
    });

    return service;
  }
}