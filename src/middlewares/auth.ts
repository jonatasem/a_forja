import type { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

// Tipagem do payload gravado dentro do JWT
interface TokenPayload {
  sub: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  iat: number;
  exp: number;
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
    // Obtém o cabeçalho de autorização enviado pelo cliente
    const authHeader = request.headers.authorization;

    if (!authHeader) {
    return reply.status(401).send({
        error: "Não autorizado.",
        message: "Token de acesso não fornecido.",
    });
}

    // Extrai o token removendo o prefixo "Bearer "
    const [, token] = authHeader.split(" ");

    if (!token) {
        return reply.status(401).send({
            error: "Não autorizado.",
            message: "Token malformado ou ausente.",
        });
    }

    const secret = process.env.JWT_SECRET || "default_secret";

  try {
    // Valida se o token é autêntico e se não expirou
    const decoded = jwt.verify(token, secret) as TokenPayload;

    // Anexa os dados decodificados no 'request.user'
    request.user = {
      sub: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      phone: decoded.phone,
      role: decoded.role,
    };
  } catch (error) {
    return reply.status(401).send({
      error: "Não autorizado.",
      message: "Token inválido ou expirado.",
    });
  }
}