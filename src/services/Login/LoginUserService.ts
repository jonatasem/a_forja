import { prisma } from "../../prisma/index.js";
import bcrypt from "bcryptjs"; // Garantido a importação do bcryptjs
import jwt from "jsonwebtoken";

interface LoginServiceProps {
  phone: string;
  password: string;
}

export class LoginUserService {
  async execute({ phone, password }: LoginServiceProps) {
    // 1. Busca o usuário pelo telefone no banco de dados
    const user = await prisma.user.findUnique({
      where: {
        phone,
      },
    });

    if (!user) {
      throw new Error("Telefone não encontrado.");
    }

    // 2. Compara a senha informada com o hash salvo no banco via bcryptjs
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Senha incorreta.");
    }

    const secretExists = process.env.JWT_SECRET;
    if (!secretExists) {
      throw new Error("Chave secreta do JWT não definida.");
    }

    const secret = process.env.JWT_SECRET;

    // Gera o token JWT assinado com a chave secreta
    const token = jwt.sign(
      {
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      secret,
      {
        subject: user.id,
        expiresIn: "2h",
      }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }
}