import { prisma } from "../../prisma/index.js";
import bcrypt from "bcryptjs"; // Utilizando a biblioteca bcryptjs
import { type CreateUserProps } from "../../controllers/User/CreateUserController.js";

export class CreateUserService {
  async execute({ name, phone, email, password }: CreateUserProps) {
    // Valida se o telefone já existe no banco de dados
    const userExists = await prisma.user.findUnique({
      where: {
        phone,
      },
    });

    if (userExists) {
      throw new Error("Já existe um usuário com este telefone.");
    }

    // Criptografa a senha recebida usando o bcryptjs com fator de custo 10
    const passwordCripted = await bcrypt.hash(password, 10);

    // Cria o novo registro no Prisma retornando apenas os campos selecionados
    const user = await prisma.user.create({
      data: {
        role: "client",
        name,
        phone,
        email,
        password: passwordCripted,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }
}