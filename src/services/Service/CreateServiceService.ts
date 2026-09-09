import { prisma } from "../../prisma/index.js";

interface CreateServiceProps {
  name: string;
  description: string;
  price: number;
  duration: number; // duração em minutos
}

export class CreateServiceService {
  async execute({ name, description, price, duration }: CreateServiceProps) {
    const serviceExists = await prisma.service.findFirst({
      where: {
        name: {
          equals: name,
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