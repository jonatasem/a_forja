import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      sub: string;
      name?: string | undefined;
      email?: string | undefined;
      phone?: string | undefined;
      role?: string | undefined;
    };
  }
}