import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      sub: string; // O identificador único do usuário (convenção padrão do JWT - Subject).
      name?: string | undefined;
      email?: string | undefined;
      phone?: string | undefined;
      role?: string | undefined;
    };
  }
}