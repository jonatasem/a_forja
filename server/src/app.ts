import fastify from "fastify";
import cors from "@fastify/cors";
import { routes } from "./routes/index.js";
import dotenv from "dotenv";

dotenv.config();

export async function buildApp() {
  // Desabilita o logger do Fastify para evitar mensagens de log desnecessárias no terminal durante o desenvolvimento.
  const app = fastify({
    logger: false,
  });

  // Configura o CORS para permitir solicitações do frontend durante o desenvolvimento.
  const urlDevelop = process.env.URL_DEVELOP;

  // Se a variável de ambiente URL_DEVELOP não estiver definida
  if (!urlDevelop) {
    throw new Error("Informe a URL_DEVELOP do frontend.");
  }

  // Cria o servidor Fastify e registra o plugin CORS
  await app.register(cors, {
    origin: urlDevelop,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Aguarda o registro das rotas
  await app.register(routes);

  // Retorna a instância do aplicativo Fastify configurada
  return app;
}