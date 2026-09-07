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
  const port = process.env.PORT;

  // Se a variável de ambiente URL_DEVELOP não estiver definida, lança um erro informando que a URL do frontend deve ser fornecida.
  if (!urlDevelop) {
    throw new Error("Informe a url do frontend.");
  }

  // Se a variável de ambiente PORT não estiver definida, lança um erro informando que a porta do backend deve ser fornecida.
  if (!port) {
    throw new Error("Informe uma porta para o backend.");
  }

  // Cria o servidor Fastify e registra o plugin CORS, permitindo solicitações do frontend especificado.
  await app.register(cors, {
    origin: urlDevelop,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Aguarda o registro das rotas definidas no arquivo routes/index.js, que contém as rotas da aplicação.
  await app.register(routes);

  // Retorna a instância do aplicativo Fastify configurada, pronta para ser usada em outros módulos ou para iniciar o servidor.
  return app;
}