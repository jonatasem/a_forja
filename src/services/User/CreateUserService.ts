import { prisma } from "../../prisma/index.js";
import bcrypt from "bcrypt";

import { type CreateUserProps } from "../../controllers/User/CreateUserController.js";

export class CreateUserService {
  async execute({ name, phone, email, password }: CreateUserProps) {
    const userExists = await prisma.user.findUnique({
      where: {
        phone,
      },
    });

    if (userExists) {
      throw new Error("Já existe um usuário com este telefone.");
    }

    const passwordCripted = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        role: "client",
        name,
        phone,
        email,
        password: passwordCripted
      },
        select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    return user;
  }
}