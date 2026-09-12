import { prisma } from "../../prisma/index.js";
import bcrypt from "bcryptjs";
import { type CreateUserProps } from "../../controllers/User/CreateUserController.js";

export class CreateUserService {
  async execute({ name, phone, email, password }: CreateUserProps) {
    // Valida se o telefone ou e-mail já existem no banco
    const userExists = await prisma.user.findFirst({
      where: {
        OR: [{ phone }, { email }],
      },
    });

    if (userExists) {
      throw new Error("Já existe um usuário com este e-mail ou telefone.");
    }

    // Criptografa a senha
    const passwordCrypted = await bcrypt.hash(password, 10);

    // O Prisma atribui 'client' automaticamente através do @default(client)
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: passwordCrypted,
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