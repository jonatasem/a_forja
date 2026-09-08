import { prisma } from '../../prisma/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface LoginServiceProps {
  phone: string;
  password: string;
}

export class LoginService {
  async execute({ phone, password }: LoginServiceProps) {
    // Busca o usuário na tabela 'user' pelo telefone
    const user = await prisma.user.findUnique({
      where: {
        phone,
      },
    });

    if (!user) {
      throw new Error('Telefone não encontrado.');
    }

    // Compara a senha digitada com o hash salvo no banco
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error('Senha incorreta.');
    }

    const secret = process.env.JWT_SECRET || 'default_secret';

    // Gerando o token JWT passando dados úteis e o subject (id do usuário)
    const token = jwt.sign(
      { 
        name: user.name,
        phone: user.phone, 
        role: user.role 
      },
      secret,
      { 
        subject: user.id, // O id fica no campo 'sub' do JWT
        expiresIn: '2h'   // Define a expiração do token (ex: 2h)
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